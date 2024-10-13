// Utility function to extract sections from CV text
const extractProfileDetails = (text) => {
    const profile = {};

    // Helper function to extract section data based on keywords
    const extractSection = (keywords) => {
        const regex = new RegExp(`(${keywords.join("|")}):?([\\s\\S]*?)(?=\\n[▶•\\-]|$)`, "i");
        const match = text.match(regex);
        return match ? match[2].trim() : null;
    };

    // Extract common personal details using regex
    const extractPersonalDetail = (label, pattern) => {
        const regex = new RegExp(`${label}:?\\s*(${pattern})`, "i");
        const match = text.match(regex);
        // Ensure that match is defined before accessing properties
        return match && match[1] ? match[1].trim() : null;
    };

    // Personal detail regex patterns
    const namePattern = "[A-Za-z]+(?: [A-Za-z]+)*";  // Simple pattern for full name
    const addressPattern = "[\\w\\s,\\-\\d]+";       // Alphanumeric and symbols for address
    const phonePattern = "[+\\d()\\s\\-]+";          // Phone numbers with international format
    const emailPattern = "[\\w.-]+@[\\w.-]+";        // Standard email format
    const agePattern = "\\d{1,3}";                   // Age as a number (1-3 digits)

    // Extract specific fields from the CV
    profile.fullName = extractPersonalDetail("Name|Full Name", namePattern);
    profile.firstName = profile.fullName ? profile.fullName.split(" ")[0] : null;
    profile.lastName = profile.fullName ? profile.fullName.split(" ").slice(-1)[0] : null;
    profile.address = extractPersonalDetail("Address", addressPattern);
    profile.phone = extractPersonalDetail("Phone|Contact", phonePattern);
    profile.email = extractPersonalDetail("Email", emailPattern);
    profile.age = extractPersonalDetail("Age", agePattern);

    // Keywords for common CV sections
    const summaryKeywords = ["Summary of Qualifications", "Professional Summary", "Profile", "Objective"];
    const skillsKeywords = ["Skills", "Core Competencies", "Key Skills"];
    const experienceKeywords = ["Work Experience", "Employment History", "Professional Experience", "Experience"];
    const educationKeywords = ["Education", "Educational Background", "Academic History"];
    const certificationsKeywords = ["Certifications", "Licenses", "Credentials"];
    const hobbiesKeywords = ["Interests", "Hobbies"];
    const referencesKeywords = ["References", "Referee"];

    // Extract sections
    profile.summary = extractSection(summaryKeywords);
    profile.skills = extractSection(skillsKeywords);
    profile.workExperience = extractSection(experienceKeywords);
    profile.education = extractSection(educationKeywords);
    profile.certifications = extractSection(certificationsKeywords);
    profile.hobbies = extractSection(hobbiesKeywords);
    profile.references = extractSection(referencesKeywords);

    // Handle possible date extraction in employment and education history
    const extractWithDates = (sectionText) => {
        const regexWithDates = /([\s\S]+?)\s+(\d{4}(?:\.\d{2})?(?:\s?–\s?\d{4}(?:\.\d{2})?)?)\s*,?\s*([\w\s,\-']+)/g;
        const entries = [];
        let match;
        while ((match = regexWithDates.exec(sectionText)) !== null) {
            entries.push({
                title: match[1].trim(),
                dateRange: match[2].trim(),
                location: match[3].trim(),
            });
        }
        return entries;
    };

    // Process work experience and education for detailed entries with dates
    profile.workExperienceDetails = profile.workExperience ? extractWithDates(profile.workExperience) : [];
    profile.educationDetails = profile.education ? extractWithDates(profile.education) : [];

    return profile;
};


module.exports = extractProfileDetails;