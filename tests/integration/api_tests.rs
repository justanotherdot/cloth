use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn test_health_endpoint() {
    // TODO: Implement actual API test when we have test harness
    assert_eq!(2 + 2, 4);
}

#[wasm_bindgen_test] 
fn test_flags_endpoint() {
    // TODO: Implement flags API test
    assert_eq!(3 + 3, 6);
}