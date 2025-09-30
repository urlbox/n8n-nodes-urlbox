# 🌐 Mega Prompt: Build an n8n Integration for Urlbox

You are building a new **n8n integration package** called `n8n-nodes-urlbox`.  
The goal is to let users generate screenshots, PDFs, and recordings of websites directly inside n8n, without needing to code.  

---

## 🔑 API Details

- **Base URL:** `https://api.urlbox.com/v1/render/sync`  
- **Authentication:** `Authorization: Bearer {token}` (header-based)  
- **Response:** JSON with fields like:  
  ```json
  {
    "renderUrl": "https://storage.cloud.google.com/renders/abc123/file.png",
    "size": 2553471,
    "renderTime": 13251.96,
    "queueTime": 78,
    "bandwidth": 4112063
  }
  ```
- Additional “side renders” may appear if options like `save_html`, `save_metadata`, `save_markdown`, `save_mhtml` are used.  
- Sync only (no async/webhook support in MVP).  
- No rate limits/retry logic required in MVP.  

---

## 🎯 Node Features

- **Node name:** `Urlbox`  
- **Operations:** One operation to “Render Website” with different templates.  
- **Authentication:**  
  - n8n should allow user to enter API key via credentials.  
- **Output:**  
  - JSON response by default (parsed as n8n data).  
  - If `response_type=binary`, output should be handled as binary data.  
- **Language:** TypeScript (n8n standard).  
- **Distribution:** Publish to npm as `n8n-nodes-urlbox` and (optionally) to n8n Marketplace.  
- **Docs:** Code should include comments. README should include usage examples.  

---

## 📸 Starting 7 Templates (Dropdown Options)

The node should expose a **“Template / Mode” dropdown** with these options.  
Each option maps to a prefilled `options` object sent to the API.  
Do not send unnecessary false/null values. Rely on API defaults.  

1. **Take Screenshot (PNG)**  
   ```json
   { "format": "png" }
   ```

2. **Thumbnail Screenshot (JPG)**  
   ```json
   { "format": "jpg" }
   ```

3. **Full Page Screenshot (PNG)**  
   ```json
   { "format": "png", "full_page": true }
   ```

4. **Mobile Screenshot (PNG)**  
   ```json
   { "format": "png", "device": "mobile" }
   ```

5. **Convert to PDF**  
   ```json
   { "format": "pdf" }
   ```

6. **Convert to MP4 (Screen Recording)**  
   ```json
   { "format": "mp4" }
   ```

7. **Clean Shot (PNG)**  
   ```json
   { "format": "png", "block_ads": true, "hide_cookie_banners": true, "click_accept": true }
   ```

---

## ⚙️ Parameters & Options

- **Required:** Either `url` (primary) or `html` (edge case). For MVP, focus on `url`.  
- **Validation:** No extra validation needed; API already validates.  
- **Extra Options (MVP):** Not required, but structure should allow adding later.  

---

## 🚨 Error Handling

- If API error, return raw error JSON from API in node output.  
- No need for UX-friendly messages in MVP.  

---

## 📦 Development Style

- Code in **TypeScript**.  
- Follow n8n conventions for nodes.  
- Include comments for maintainability.  
- Unit tests not required for MVP.  

---

## 📝 High-Level Execution Overview (Follow This)

Use this as a high-level checklist, based on n8n’s official documentation:

1. **Review standards**: Read “Build a node” docs and community-node guidelines.  
2. **Scaffold project**: Use the official `n8n-node-dev` CLI to generate a new package (`n8n-nodes-urlbox`).  
3. **Add credentials**: One credential class for API key, injected as `Authorization: Bearer {token}`.  
4. **Define node**:  
   - Single operation: “Render Website”.  
   - Add the **Template/Mode dropdown** with the 7 starting templates above.  
   - Expose required `url` field.  
5. **Implement execution**:  
   - Build the API payload (merge template options + user input).  
   - Call `https://api.urlbox.com/v1/render/sync`.  
   - Return JSON response.  
   - If `response_type=binary`, pipe output into n8n’s binary system.  
6. **Error handling**: Pass raw API errors back to users (MVP style).  
7. **Local dev/test**: Build and run node locally; test in n8n editor with PNG, PDF, and MP4 outputs.  
8. **Package quality**: Add README with install/usage, examples, and template descriptions.  
9. **Publish to npm**: Under `n8n-nodes-urlbox`.  
10. **(Optional)** Submit for Marketplace verification if you want official listing.  

---

✅ With this prompt, the model has **API details, templates, requirements, and the high-level execution steps** you expect it to follow.  
