use worker::*;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[event(fetch)]
async fn main(req: Request, env: Env, _ctx: Context) -> Result<Response> {
    Router::new()
        .get("/", |_, _| Response::ok("Cloth Feature Flag API"))
        .get_async("/health", health_check)
        .get_async("/api/flags", list_flags)
        .post_async("/api/flags", create_flag)
        .get_async("/api/flags/:key", get_flag)
        .put_async("/api/flags/:key", update_flag)
        .delete_async("/api/flags/:key", delete_flag)
        .get_async("/api/flags/:key/evaluate", evaluate_flag)
        .run(req, env)
        .await
}

async fn health_check(_req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    Response::ok("OK")
}

async fn list_flags(_req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    Response::from_json(&serde_json::json!({
        "flags": []
    }))
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
    Response::from_json(&serde_json::json!({
        "key": key,
        "enabled": false,
        "evaluated_at": now.as_string().unwrap_or_else(|| "unknown".to_string())
    }))
}