SELECT name, model_key, JSON_EXTRACT(default_params_json, '$.billingRule') AS billing_rule FROM ai_models WHERE category = 'VIDEO';
