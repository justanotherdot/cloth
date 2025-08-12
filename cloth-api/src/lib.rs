use worker::*;
use jsonwebtoken::{decode, decode_header, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct CloudflareAccessClaims {
    sub: String,
    email: String,
    iss: String,
    aud: Vec<String>,
    exp: usize,
    iat: usize,
}

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[event(fetch)]
async fn main(req: Request, env: Env, _ctx: Context) -> Result<Response> {
    Router::new()
        // Public API routes (no auth required)
        .get_async("/api/flags/:key/evaluate", evaluate_flag)
        .get_async("/health", health_check)
        
        // Protected control plane routes (require JWT auth)
        .get_async("/api/flags", |req, ctx| async move { jwt_middleware(req, ctx, list_flags).await })
        .post_async("/api/flags", |req, ctx| async move { jwt_middleware(req, ctx, create_flag).await })
        .get_async("/api/flags/:key", |req, ctx| async move { jwt_middleware(req, ctx, get_flag).await })
        .put_async("/api/flags/:key", |req, ctx| async move { jwt_middleware(req, ctx, update_flag).await })
        .delete_async("/api/flags/:key", |req, ctx| async move { jwt_middleware(req, ctx, delete_flag).await })
        
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

async fn jwt_middleware<F, Fut>(
    req: Request,
    ctx: RouteContext<()>,
    handler: F,
) -> Result<Response>
where
    F: FnOnce(Request, RouteContext<()>) -> Fut,
    Fut: std::future::Future<Output = Result<Response>>,
{
    // Check for Cloudflare Access JWT header
    let jwt_token = match req.headers().get("Cf-Access-Jwt-Assertion")? {
        Some(token) => token,
        None => {
            // Fallback to Authorization header for direct JWT testing
            match req.headers().get("Authorization")? {
                Some(auth) if auth.starts_with("Bearer ") => auth[7..].to_string(),
                _ => {
                    let mut response = Response::empty()?;
                    response.headers_mut().set("Access-Control-Allow-Origin", "*")?;
                    return Ok(response.with_status(401));
                }
            }
        }
    };

    // Validate JWT
    let authorized = validate_cloudflare_access_jwt(&jwt_token, &ctx.env).await.unwrap_or(false);
    
    if authorized {
        handler(req, ctx).await
    } else {
        let mut response = Response::empty()?;
        response.headers_mut().set("Access-Control-Allow-Origin", "*")?;
        Ok(response.with_status(401))
    }
}

async fn validate_cloudflare_access_jwt(token: &str, env: &Env) -> Result<bool> {
    // For now, we'll do basic JWT structure validation
    // In production, you'd validate against Cloudflare's public keys
    
    // Decode header to check algorithm
    let header = decode_header(token).map_err(|_| Error::from("Invalid JWT header"))?;
    
    if header.alg != Algorithm::RS256 {
        return Ok(false);
    }

    // For development, we'll skip signature validation
    // In production, fetch public keys from CF Access endpoint
    let mut validation = Validation::new(Algorithm::RS256);
    validation.insecure_disable_signature_validation(); // TODO: Remove in production
    
    // Get expected issuer and audience from environment
    let expected_issuer = env.var("CF_ACCESS_ISSUER")?.to_string();
    let expected_audience = env.var("CF_ACCESS_AUDIENCE")?.to_string();
    
    validation.set_issuer(&[expected_issuer]);
    validation.set_audience(&[expected_audience]);

    // Use dummy key since we disabled signature validation
    let key = DecodingKey::from_secret("dummy".as_ref());
    
    match decode::<CloudflareAccessClaims>(token, &key, &validation) {
        Ok(_claims) => {
            // JWT is valid, user is authenticated
            Ok(true)
        }
        Err(_) => Ok(false)
    }
}