# n8n-nodes-urlbox

This is an n8n community node. It lets you generate screenshots, PDFs, and screen recordings of websites using [Urlbox](https://urlbox.com) in your n8n workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Templates](#templates)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Templates

The Urlbox node includes 7 pre-configured templates:

- **Take Screenshot (PNG)** - Capture a standard PNG screenshot
- **Thumbnail Screenshot (JPG)** - Capture a thumbnail JPG screenshot
- **Full Page Screenshot (PNG)** - Capture the entire page as PNG
- **Mobile Screenshot (PNG)** - Capture a mobile view screenshot
- **Convert to PDF** - Convert the website to PDF format
- **Convert to MP4 (Screen Recording)** - Record the website as MP4 video
- **Clean Shot (PNG)** - Screenshot with ads and cookie banners removed

## Credentials

You need a Urlbox API key to use this node.

1. Sign up for a [Urlbox account](https://urlbox.com/signup)
2. Navigate to your [API Keys page](https://urlbox.com/dashboard/api-keys)
3. Copy your secret API key
4. In n8n, create new Urlbox API credentials and paste your API key

For more information, refer to the [Urlbox authentication documentation](https://urlbox.com/docs/api#authentication).

## Compatibility

Compatible with n8n@1.60.0 or later

## Usage

### Basic Example

1. Add the Urlbox node to your workflow
2. Configure your Urlbox API credentials
3. Select a template (e.g., "Take Screenshot (PNG)")
4. Enter the URL you want to capture
5. Execute the node

The node returns a JSON response containing:
- `renderUrl`: The URL of your generated screenshot/PDF/video
- `size`: File size in bytes
- `renderTime`: Time taken to render in milliseconds
- Additional metadata

### Example Response

```json
{
  "renderUrl": "https://storage.cloud.google.com/renders/abc123/file.png",
  "size": 2553471,
  "renderTime": 13251.96,
  "queueTime": 78,
  "bandwidth": 4112063
}
```

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Urlbox API documentation](https://urlbox.com/docs/api)
* [Urlbox website](https://urlbox.com)
