use cloth_core::data::*;

pub fn simple_flag() -> Flag {
    Flag::new("simple-test", true, FlagMetadata::default())
}

pub fn segmented_flag() -> Flag {
    Flag::with_strategy(
        "segmented-test",
        EvaluationStrategy::UserSegment {
            included_users: vec!["test-user-1".to_string(), "test-user-2".to_string()],
            excluded_users: vec![],
        },
    )
}

pub fn percentage_flag() -> Flag {
    Flag::with_strategy(
        "percentage-test",
        EvaluationStrategy::Percentage { percentage: 50.0 },
    )
}

pub fn disabled_flag() -> Flag {
    Flag::new("disabled-test", false, FlagMetadata::default())
}