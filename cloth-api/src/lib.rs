use worker::*;
use base64::{Engine as _, engine::general_purpose};

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[event(fetch)]
async fn main(req: Request, env: Env, _ctx: Context) -> Result<Response> {
    Router::new()
        // Public API routes (no auth required)
        .get_async("/api/flags/:key/evaluate", evaluate_flag)
        .get_async("/health", health_check)
        
        // Protected control plane routes (require auth)
        .get_async("/api/flags", |req, ctx| async move { auth_middleware(req, ctx, list_flags).await })
        .post_async("/api/flags", |req, ctx| async move { auth_middleware(req, ctx, create_flag).await })
        .get_async("/api/flags/:key", |req, ctx| async move { auth_middleware(req, ctx, get_flag).await })
        .put_async("/api/flags/:key", |req, ctx| async move { auth_middleware(req, ctx, update_flag).await })
        .delete_async("/api/flags/:key", |req, ctx| async move { auth_middleware(req, ctx, delete_flag).await })
        
        .run(req, env)
        .await
}

async fn health_check(_req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    Response::ok("OK")
}

async fn list_flags(_req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    let mut response = Response::from_json(&serde_json::json!({
        "flags": []
    }))?;
    response.headers_mut().set("Access-Control-Allow-Origin", "*")?;
    Ok(response)
}

async fn create_flag(_req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    let response = Response::from_json(&serde_json::json!({
        "message": "Flag created"
    }))?;
    Ok(response.with_status(201))
}

async fn get_flag(_req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let key = ctx.param("key").map(|s| s.as_str()).unwrap_or("unknown");
    Response::from_json(&serde_json::json!({
        "key": key,
        "enabled": false
    }))
}

async fn update_flag(_req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let key = ctx.param("key").map(|s| s.as_str()).unwrap_or("unknown");
    Response::from_json(&serde_json::json!({
        "key": key,
        "message": "Flag updated"
    }))
}

async fn delete_flag(_req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let key = ctx.param("key").map(|s| s.as_str()).unwrap_or("unknown");
    Response::from_json(&serde_json::json!({
        "key": key,
        "message": "Flag deleted"
    }))
}

async fn evaluate_flag(_req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let key = ctx.param("key").map(|s| s.as_str()).unwrap_or("unknown");
    let now = js_sys::Date::new_0().to_iso_string();
    let mut response = Response::from_json(&serde_json::json!({
        "key": key,
        "enabled": false,
        "evaluated_at": now.as_string().unwrap_or_else(|| "unknown".to_string())
    }))?;
    
    response.headers_mut().set("Access-Control-Allow-Origin", "*")?;
    Ok(response)
}

async fn auth_middleware<F, Fut>(
    req: Request,
    ctx: RouteContext<()>,
    handler: F,
) -> Result<Response>
where
    F: FnOnce(Request, RouteContext<()>) -> Fut,
    Fut: std::future::Future<Output = Result<Response>>,
{
    let auth_header = req.headers().get("Authorization")?;
    
    let authorized = match auth_header {
        Some(auth) if auth.starts_with("Basic ") => {
            let encoded = &auth[6..]; // Remove "Basic " prefix
            if let Ok(decoded) = general_purpose::STANDARD.decode(encoded) {
                if let Ok(credentials) = String::from_utf8(decoded) {
                    let parts: Vec<&str> = credentials.splitn(2, ':').collect();
                    if parts.len() == 2 {
                        let username = parts[0];
                        let password = parts[1];
                        
                        let expected_username = ctx.env.var("AUTH_USERNAME")?.to_string();
                        let expected_password = ctx.env.var("AUTH_PASSWORD")?.to_string();
                        
                        username == expected_username && password == expected_password
                    } else {
                        false
                    }
                } else {
                    false
                }
            } else {
                false
            }
        }
        _ => false,
    };
    
    if authorized {
        handler(req, ctx).await
    } else {
        let mut response = Response::empty()?;
        response.headers_mut().set("WWW-Authenticate", "Basic realm=\"Cloth Control Plane\"")?;
        Ok(response.with_status(401))
    }
}