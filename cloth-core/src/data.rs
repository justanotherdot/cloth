use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Flag {
    pub key: String,
    pub enabled: bool,
    pub name: String,
    pub description: Option<String>,
    pub strategy: EvaluationStrategy,
    pub metadata: FlagMetadata,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FlagMetadata {
    pub created_at: String,
    pub updated_at: String,
    pub created_by: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum EvaluationStrategy {
    #[serde(rename = "simple")]
    Simple,
    #[serde(rename = "user_segment")]
    UserSegment {
        included_users: Vec<String>,
        excluded_users: Vec<String>,
    },
    #[serde(rename = "percentage")]
    Percentage {
        percentage: f32,
    },
}

#[derive(Debug, Clone)]
pub struct EvaluationContext {
    pub user_id: Option<String>,
    pub session_id: Option<String>,
    pub attributes: std::collections::HashMap<String, String>,
}

impl Flag {
    pub fn new(key: &str, enabled: bool, metadata: FlagMetadata) -> Self {
        Flag {
            key: key.to_string(),
            enabled,
            name: key.to_string(),
            description: None,
            strategy: EvaluationStrategy::Simple,
            metadata,
        }
    }

    pub fn with_strategy(key: &str, strategy: EvaluationStrategy) -> Self {
        Flag {
            key: key.to_string(),
            enabled: true,
            name: key.to_string(),
            description: None,
            strategy,
            metadata: FlagMetadata::default(),
        }
    }

    pub fn evaluate(&self, context: &EvaluationContext) -> bool {
        if !self.enabled {
            return false;
        }

        match &self.strategy {
            EvaluationStrategy::Simple => true,
            EvaluationStrategy::UserSegment { included_users, excluded_users } => {
                if let Some(user_id) = &context.user_id {
                    if excluded_users.contains(user_id) {
                        return false;
                    }
                    included_users.contains(user_id)
                } else {
                    false
                }
            }
            EvaluationStrategy::Percentage { percentage } => {
                if let Some(user_id) = &context.user_id {
                    let hash = hash_string(user_id);
                    (hash % 100.0) < *percentage
                } else {
                    false
                }
            }
        }
    }
}

impl FlagMetadata {
    pub fn default() -> Self {
        FlagMetadata {
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
            created_by: "system".to_string(),
        }
    }
}

impl EvaluationContext {
    pub fn empty() -> Self {
        EvaluationContext {
            user_id: None,
            session_id: None,
            attributes: std::collections::HashMap::new(),
        }
    }

    pub fn new() -> Self {
        Self::empty()
    }

    pub fn with_user_id(mut self, user_id: &str) -> Self {
        self.user_id = Some(user_id.to_string());
        self
    }

    pub fn with_session_id(mut self, session_id: &str) -> Self {
        self.session_id = Some(session_id.to_string());
        self
    }
}

fn hash_string(input: &str) -> f32 {
    let mut hash: u32 = 0;
    for byte in input.bytes() {
        hash = hash.wrapping_mul(31).wrapping_add(byte as u32);
    }
    (hash % 100) as f32
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn flag_evaluation_boolean() {
        let flag = Flag::new("test", true, FlagMetadata::default());
        let context = EvaluationContext::empty();
        assert!(flag.evaluate(&context));
    }

    #[test]
    fn flag_evaluation_disabled() {
        let flag = Flag::new("test", false, FlagMetadata::default());
        let context = EvaluationContext::empty();
        assert!(!flag.evaluate(&context));
    }

    #[test]
    fn flag_evaluation_with_targeting() {
        let flag = Flag::with_strategy(
            "test",
            EvaluationStrategy::UserSegment {
                included_users: vec!["user123".to_string()],
                excluded_users: vec![],
            },
        );
        let context = EvaluationContext::new().with_user_id("user123");
        assert!(flag.evaluate(&context));
    }

    #[test]
    fn flag_evaluation_excluded_user() {
        let flag = Flag::with_strategy(
            "test",
            EvaluationStrategy::UserSegment {
                included_users: vec!["user123".to_string()],
                excluded_users: vec!["user123".to_string()],
            },
        );
        let context = EvaluationContext::new().with_user_id("user123");
        assert!(!flag.evaluate(&context));
    }

    #[test]
    fn flag_evaluation_percentage() {
        let flag = Flag::with_strategy(
            "test",
            EvaluationStrategy::Percentage { percentage: 50.0 },
        );
        
        let context_user1 = EvaluationContext::new().with_user_id("user1");
        let context_user2 = EvaluationContext::new().with_user_id("user2");
        
        let result1 = flag.evaluate(&context_user1);
        let result2 = flag.evaluate(&context_user2);
        
        assert!(result1 == result1);
        assert!(result2 == result2);
    }

    #[test]
    fn evaluation_context_builder() {
        let context = EvaluationContext::new()
            .with_user_id("user123")
            .with_session_id("session456");
        
        assert_eq!(context.user_id, Some("user123".to_string()));
        assert_eq!(context.session_id, Some("session456".to_string()));
    }

    #[test]
    fn flag_serialization() {
        let flag = Flag::new("test", true, FlagMetadata::default());
        let serialized = serde_json::to_string(&flag).unwrap();
        let deserialized: Flag = serde_json::from_str(&serialized).unwrap();
        
        assert_eq!(flag.key, deserialized.key);
        assert_eq!(flag.enabled, deserialized.enabled);
    }
}