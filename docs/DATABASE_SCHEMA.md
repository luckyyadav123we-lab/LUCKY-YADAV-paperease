# PaperEase — Database Schema & Architecture

PaperEase operates a zero-retention privacy architecture for client-side document processing, combined with persistent relational schema for user authentication, subscription tiers, usage quotas, and administrative telemetry.

## Relational Schema (PostgreSQL / Supabase / SQLite)

### 1. `users`
Represents registered user accounts.
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(120),
    avatar_url TEXT,
    tier VARCHAR(32) NOT NULL DEFAULT 'free', -- 'free' | 'pro' | 'business'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. `subscriptions`
Manages billing status and entitlement sync.
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier VARCHAR(32) NOT NULL, -- 'pro' | 'business'
    status VARCHAR(32) NOT NULL, -- 'active' | 'past_due' | 'canceled'
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. `usage_records`
Enforces daily processing quotas per user tier.
```sql
CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    operations_count INT NOT NULL DEFAULT 1,
    bytes_processed BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT unique_user_daily_usage UNIQUE (user_id, usage_date)
);
```

### 4. `conversion_jobs`
Audit log of completed or failed transformations without storing sensitive document contents.
```sql
CREATE TABLE conversion_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tool_id VARCHAR(64) NOT NULL,
    input_format VARCHAR(16) NOT NULL,
    output_format VARCHAR(16) NOT NULL,
    input_file_size BIGINT NOT NULL,
    output_file_size BIGINT,
    status VARCHAR(32) NOT NULL, -- 'completed' | 'failed'
    processing_latency_ms INT,
    error_category VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. `rate_limits`
Configurable operational caps administered through the admin console.
```sql
CREATE TABLE rate_limits (
    tier VARCHAR(32) PRIMARY KEY,
    max_daily_operations INT NOT NULL,
    max_file_size_bytes BIGINT NOT NULL,
    max_batch_files INT NOT NULL,
    ocr_enabled BOOLEAN NOT NULL DEFAULT FALSE
);
```
