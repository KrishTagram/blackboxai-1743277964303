// Resume Generator - Handles form data processing and resume generation

// DOM Elements
const resumeForm = document.getElementById('resume-form');
const downloadPdfBtn = document.getElementById('download-pdf');
const printBtn = document.getElementById('print-resume');

// Form data storage
let resumeData = {
    personal: {},
    summary: '',
    education: [],
    experience: [],
    skills: [],
    certifications: []
};

// Initialize form
document.addEventListener('DOMContentLoaded', function() {
    // Load saved data if available
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
        resumeData = JSON.parse(savedData);
        populateReviewSection();
    }

    // Form submission handler
    if (resumeForm) {
        resumeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            collectFormData();
            localStorage.setItem('resumeData', JSON.stringify(resumeData));
            window.location.href = 'resume-template.html';
        });
    }

    // PDF generation handler
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', generatePDF);
    }

    // Print handler
    if (printBtn) {
        printBtn.addEventListener('click', window.print);
    }
});

// Collect data from form fields
function collectFormData() {
    // Personal Information
    resumeData.personal = {
        name: document.getElementById('full-name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        linkedin: document.getElementById('linkedin').value
    };

    // Professional Summary
    resumeData.summary = document.getElementById('summary').value;

    // Education
    resumeData.education = [];
    const educationFields = document.querySelectorAll('.education-field');
    educationFields.forEach((field, index) => {
        resumeData.education.push({
            degree: document.getElementById(`education-degree-${index+1}`).value,
            institution: document.getElementById(`education-institution-${index+1}`).value,
            start: document.getElementById(`education-start-${index+1}`).value,
            end: document.getElementById(`education-end-${index+1}`).value
        });
    });

    // Experience
    resumeData.experience = [];
    const experienceFields = document.querySelectorAll('.experience-field');
    experienceFields.forEach((field, index) => {
        resumeData.experience.push({
            title: document.getElementById(`experience-title-${index+1}`).value,
            company: document.getElementById(`experience-company-${index+1}`).value,
            start: document.getElementById(`experience-start-${index+1}`).value,
            end: document.getElementById(`experience-end-${index+1}`).value,
            description: document.getElementById(`experience-description-${index+1}`).value
        });
    });

    // Skills
    resumeData.skills = [];
    const skillInputs = document.querySelectorAll('input[name="skills[]"]');
    skillInputs.forEach(input => {
        if (input.value.trim() !== '') {
            resumeData.skills.push(input.value.trim());
        }
    });

    // Certifications
    resumeData.certifications = [];
    const certificationFields = document.querySelectorAll('.certification-field');
    certificationFields.forEach((field, index) => {
        resumeData.certifications.push({
            name: document.getElementById(`certification-name-${index+1}`).value,
            issuer: document.getElementById(`certification-issuer-${index+1}`).value,
            date: document.getElementById(`certification-date-${index+1}`).value
        });
    });
}

// Populate review section with collected data
function populateReviewSection() {
    // Personal Information
    document.getElementById('resume-name').textContent = resumeData.personal.name;
    document.getElementById('resume-email').textContent = resumeData.personal.email;
    document.getElementById('resume-phone').textContent = resumeData.personal.phone;
    document.getElementById('resume-linkedin').textContent = resumeData.personal.linkedin;

    // Summary
    document.getElementById('resume-summary').textContent = resumeData.summary;

    // Education
    const educationContainer = document.getElementById('resume-education');
    educationContainer.innerHTML = '';
    resumeData.education.forEach(edu => {
        const eduElement = document.createElement('div');
        eduElement.className = 'mb-4';
        eduElement.innerHTML = `
            <div class="flex justify-between mb-1">
                <h3 class="font-semibold text-gray-800">${edu.degree}</h3>
                <span class="text-gray-600">${formatDateRange(edu.start, edu.end)}</span>
            </div>
            <div class="text-gray-700">
                <p>${edu.institution}</p>
            </div>
        `;
        educationContainer.appendChild(eduElement);
    });

    // Experience
    const experienceContainer = document.getElementById('resume-experience');
    experienceContainer.innerHTML = '';
    resumeData.experience.forEach(exp => {
        const expElement = document.createElement('div');
        expElement.className = 'mb-4';
        expElement.innerHTML = `
            <div class="flex justify-between">
                <h3 class="font-semibold text-gray-800">${exp.title}</h3>
                <span class="text-gray-600">${formatDateRange(exp.start, exp.end)}</span>
            </div>
            <div class="flex justify-between text-gray-700 mb-1">
                <span>${exp.company}</span>
            </div>
            <ul class="list-disc pl-5 text-gray-700 space-y-1 mt-2">
                ${exp.description.split('\n').filter(line => line.trim() !== '').map(line => `<li>${line}</li>`).join('')}
            </ul>
        `;
        experienceContainer.appendChild(expElement);
    });

    // Skills
    const skillsContainer = document.getElementById('resume-skills');
    skillsContainer.innerHTML = '';
    resumeData.skills.forEach(skill => {
        const skillElement = document.createElement('span');
        skillElement.className = 'px-3 py-1 bg-gray-100 text-gray-800 rounded-full';
        skillElement.textContent = skill;
        skillsContainer.appendChild(skillElement);
    });

    // Certifications
    const certContainer = document.getElementById('resume-certifications');
    certContainer.innerHTML = '';
    resumeData.certifications.forEach(cert => {
        const certElement = document.createElement('div');
        certElement.className = 'mb-2';
        certElement.innerHTML = `
            <h3 class="font-medium text-gray-800">${cert.name}</h3>
            <p class="text-gray-600">${cert.issuer} - ${formatDate(cert.date)}</p>
        `;
        certContainer.appendChild(certElement);
    });
}

// Format date range for display
function formatDateRange(start, end) {
    const startDate = start ? new Date(start + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '';
    const endDate = end ? (end.toLowerCase() === 'present' ? 'Present' : 
        new Date(end + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })) : 'Present';
    return `${startDate} - ${endDate}`;
}

// Format single date for display
function formatDate(dateString) {
    return dateString ? new Date(dateString + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '';
}

// Generate PDF from resume content
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Get HTML content of resume
    const resumeContent = document.getElementById('resume-content');
    
    // Use html2canvas to capture the resume as an image
    html2canvas(resumeContent).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = doc.internal.pageSize.getWidth() - 20;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        doc.save('resume.pdf');
    });
}

// Helper function to add months to a date
function addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}