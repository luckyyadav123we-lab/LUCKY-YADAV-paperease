# PaperEase — REST API & Pipeline Documentation

PaperEase provides both a high-speed browser-isolated client engine (using WebAssembly, pdf-lib, Canvas 2D, SheetJS, and Tesseract.js) and standard REST API endpoints for server or headless programmatic integrations.

## Core API Endpoints

### 1. Document & File Processing Endpoints

#### `POST /api/pdf/merge`
Combines multiple ordered PDF streams into a unified document.
- **Request Body**: `multipart/form-data` with `files: File[]`
- **Response**: `application/pdf` binary stream
- **Headers**: `Content-Disposition: attachment; filename="merged_document.pdf"`

#### `POST /api/pdf/split`
Extracts designated page ranges or cuts a PDF into distinct parts.
- **Request Body**: `multipart/form-data` with `file: File`, `page_range: string` (e.g. `"1-3, 5"`)
- **Response**: `application/pdf` binary stream

#### `POST /api/pdf/compress`
Reduces document payload by stripping unreferenced object streams and optimizing stream flate encoding.
- **Request Body**: `multipart/form-data` with `file: File`, `level: 'low' | 'balanced' | 'high'`
- **Response**: `application/pdf` with custom headers `X-Original-Size` and `X-Compressed-Size`

#### `POST /api/pdf/to-word`
Extracts text and paragraph structures and formats into valid OpenXML WordprocessingML (`.docx`).
- **Request Body**: `multipart/form-data` with `file: File`
- **Response**: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

#### `POST /api/pdf/to-excel`
Parses row delimiters and tabular data into genuine Excel (`.xlsx`) spreadsheet cells.
- **Request Body**: `multipart/form-data` with `file: File`
- **Response**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

#### `POST /api/image/convert`
Converts images between PNG, JPG, WEBP, and BMP with selectable transparency fill and quality slider.
- **Request Body**: `multipart/form-data` with `file: File`, `format: 'jpeg' | 'png' | 'webp'`, `quality: float (0.1 - 1.0)`, `bg_color: string`
- **Response**: Target image MIME type

#### `POST /api/ocr/recognize`
Extracts text from scanned documents or photos via neural optical character recognition.
- **Request Body**: `multipart/form-data` with `file: File`, `language: 'eng' | 'spa' | 'fra' | 'deu'`
- **Response**: JSON with `{ "text": string, "confidence": number }`

---

### 2. User & Admin Telemetry Endpoints

#### `GET /api/user/profile`
Retrieves authenticated user profile, tier, and remaining daily quota.

#### `POST /api/user/tier`
Updates or tests switching user subscription tier (`free`, `pro`, `business`).

#### `GET /api/admin/metrics`
Returns administrative audit metrics: total jobs, success rate, throughput volume, and engine latency.
