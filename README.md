# Me-Resu 🎯

AI-Powered Resume Assistant that creates ATS-optimized resumes for IT professionals with an interactive chat-based experience.

## ✨ Features

- **Interactive Chat Interface**: Conversational UI that guides you through resume creation
- **Smart Option Selection**: No need to type everything - select from curated options
- **Country-Specific**: Tailored recommendations based on your target country
- **ATS Optimization**: Keywords and formatting that pass any ATS screening
- **Dual Templates**: Classic (B&W) and Modern (color) resume templates
- **Job Description Matching**: Tailors resume to specific job postings
- **Real Job Websites**: Curated list of legitimate job platforms
- **Profile Completeness**: Real-time tracking of your profile strength
- **Preview Before Download**: See your resume before generating PDF

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Groq API Key (get it from [console.groq.com](https://console.groq.com/keys))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd me-resu
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Groq API Key**
   ```bash
   # The API key is pre-configured in the app
   # Update in src/app/page.tsx if needed
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📋 How It Works

1. **Select Your Country** - Choose from popular job markets
2. **Pick Your Skills** - Select from common IT skills or type custom ones
3. **Choose Target Roles** - AI suggests roles based on your skills
4. **Select Experience Level** - Multiple choice options
5. **Optional: Add Job Description** - For tailored applications
6. **Preview & Download** - See your ATS-optimized resume

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Modern styling
- **Groq API** - Fast AI inference with Llama 3
- **Framer Motion** - Smooth animations
- **html2pdf.js** - PDF generation

## 🌍 Supported Countries

- United States
- United Kingdom
- Canada
- Australia
- Germany
- India
- Singapore
- And more...

## 📝 Resume Sections Generated

- Professional Summary (ATS-optimized)
- Technical Skills
- Work Experience (with placeholders for achievements)
- Education
- Certifications
- Keywords for ATS matching

## 🔒 API Key Security

The Groq API key is embedded in the application. For production deployment:

1. Store in environment variables
2. Use server-side API routes
3. Implement rate limiting

## 🚀 Deployment on Vercel

1. Push to GitHub
2. Import project to Vercel
3. Add environment variable:
   ```
   GROQ_API_KEY=your_key_here
   ```
4. Deploy!

## 💡 Tips for Best Results

- Select multiple skills for better role suggestions
- Provide job description for targeted applications
- Download in PDF format for ATS submission
- Apply through multiple recommended platforms
- Update your profile completeness for better chances

## 📄 License

MIT License - Feel free to use and modify!

## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss changes.

---

Made with ❤️ for job seekers worldwide