# Prompt for Hungarian Banking QR Code Generator

Create a static HTML webpage that generates QR codes for Hungarian bank transfers using the official MNB (Hungarian National Bank) standard. The webpage should be user-friendly with a blue color scheme and include the following specifications:

## Core Requirements:

### User Interface:
- **Design**: Modern, clean blue color scheme that is very user-friendly
- **Responsive**: Works well on desktop and mobile devices
- **Language**: **English as default** with Hungarian language option and real-time switching
- **Layout**: Single-page application with form fields and output area
- **Language Selector**: Top-right corner dropdown for instant language switching with localStorage persistence

### Input Fields (Required):
1. **Account Owner Name** (Számlatulajdonos neve): Text field, max 70 characters
2. **Account Number** (Számlaszám): Hungarian 3x8 format (XX-XXXXXX-XXXXXXXX)
   - Input format: 8-digit bank code, hyphen, 8-digit branch code, hyphen, 8-digit account number
   - Example: "11773016-11111018-00000000"
   - Auto-format with hyphens as user types
3. **Amount in HUF** (Összeg): Numeric field with HUF currency
4. **Description/Reference** (Közlemény): Text field, max 70 characters

### Automatic Calculations:
- **IBAN Conversion**: Automatically convert the 3x8 account number to 28-character Hungarian IBAN format
- **BIC Code**: Calculate appropriate BIC code based on the bank code (first 3 digits)
- **Timestamp**: Generate current timestamp in Hungarian timezone (Europe/Budapest)
- **Validity Period**: Set QR code validity to 24 hours from generation time

### QR Code Generation:
Follow the official MNB specification with these 17 data fields (separated by LF characters):

1. **ID Code**: "HCT" (Hungarian Credit Transfer)
2. **Version**: "001"
3. **Character Set**: "1" (UTF-8)
4. **BIC**: Calculated from bank code
5. **Name**: Account owner name (from input)
6. **IBAN**: Converted from 3x8 format
7. **Amount**: "HUF" + amount (e.g., "HUF1000")
8. **Validity**: YYYYMMDDhhmmss+Z format in Europe/Budapest timezone
9. **Payment Situation**: "CBFF" (default for business-to-business transactions)
10. **Description**: User-provided description
11. **Shop ID**: Empty (leave blank)
12. **Device ID**: Empty (leave blank)
13. **Invoice ID**: Empty (leave blank)
14. **Customer ID**: Empty (leave blank)
15. **Transaction ID**: Empty (leave blank)
16. **Loyalty ID**: Empty (leave blank)
17. **NAV Code**: Empty (leave blank)

### Output Features:
- **Text Output**: Display the complete QR code data string in a copyable text area
- **QR Code Image**: Generate and display the actual QR code image (maximum version 13, error correction level M)
- **Copy to Clipboard**: Button to copy the text string
- **Download QR**: Option to download the QR code image
- **Reset Form**: Clear all fields button

### Technical Specifications:
- **Time Zone Handling**: Proper Europe/Budapest timezone with DST support
- **Validation**: 
  - Validate Hungarian account number format
  - Check required fields
  - Validate amount (positive numbers only)
  - Character limits on text fields
- **IBAN Calculation**: Implement proper Hungarian IBAN algorithm with check digits
- **QR Code**: Use reliable QRious library from CDN (https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js)
- **External Dependencies**: QRious library loaded from CDN for stable, non-freezing QR generation

### BIC Code Mapping:
Include a mapping of major Hungarian bank codes to their BIC codes:
- K&H Bank: 104 → OKHBHUHB
- **CIB Bank: 107 → CIBHHUHB** (CRITICAL: Multiple CIB codes supported)
- CIB Bank: 108 → CIBHHUHB
- UniCredit Bank: 109 → BACXHUHB
- Erste Bank: 116 → GIBAHUHB
- OTP Bank: 117 → OTPVHUHB
- Raiffeisen Bank: 120 → UBRTHUHB
- Budapest Bank: 128 → BKCHHUHU
- MKB Bank: 138 → HBWEHUHB
- Commerzbank: 149 → BUDDHUHU
- Gránit Bank: 159 → GRANHUHU

### Error Handling:
- Clear error messages in **current selected language** (English/Hungarian)
- Field-specific validation feedback
- Prevent generation with invalid data
- Graceful handling of timezone issues
- **QR Generation Fallback**: If QR image generation fails, provides clear instructions and data download option

### User Experience:
- Auto-format account number with hyphens
- Real-time validation feedback
- Loading state during QR generation
- Success confirmation after generation
- Mobile-friendly touch targets
- **Data Preview**: Shows generated QR text data immediately before QR image generation
- **Progressive Enhancement**: Text data loads first, QR image generates after 100ms delay for smooth UX

Create this as a complete, functional single HTML file that can be opened in any modern web browser and used immediately for generating Hungarian banking QR codes according to the official MNB standard.

## Updated MNB Specification Knowledge:

### Official MNB QR Code Standard:
Based on the official MNB documentation "Guidelines on the QR code data entry solution applicable in the instant payment system", the Hungarian QR code system is specifically designed for:
- **HCT (Hungarian Credit Transfer)** format
- Integration with Hungary's **instant payment system** launched March 2, 2020
- **24/7/365 availability** for domestic Hungarian payments
- Compliance with MNB and GIRO infrastructure requirements

### Payment Situation Codes:
- **CBFF**: Business-to-business transactions (recommended default)
- **GDSV**: Retail/person-to-person transactions
- Other codes available for specific transaction types

### Hungarian IBAN Structure:
- **28 characters total**: HU + 2 check digits + 24 digit account number
- **Account format**: First 3 digits = bank code (MNB issued), next 5 digits = branch code
- **Check digit calculation**: Uses modulo 97 algorithm per ISO 13616 standard

### Timezone Specification:
- **Europe/Budapest timezone** with proper DST handling
- **Validity format**: YYYYMMDDhhmmss+01:00 (winter) or +02:00 (summer)
- **24-hour validity period** from generation time

### Integration Notes:
- System designed to avoid non-interoperable solutions
- Facilitates widespread adoption of instant payment solutions
- Supports domestic Hungarian payment infrastructure
- Follows European banking standards where applicable
