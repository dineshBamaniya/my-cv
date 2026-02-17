'use client'

import { useState, useRef, useEffect } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export default function Home() {
    // Calculate years of experience from join date
    const calculateExperience = () => {
        const joinDate = new Date('2021-05-10') // May 10, 2021
        const currentDate = new Date()
        const diffTime = Math.abs(currentDate.getTime() - joinDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        const years = diffDays / 365.25
        return {
            precise: years.toFixed(1),
            whole: Math.floor(years),
        }
    }

    const experience = calculateExperience()
    const experienceYearsWhole = experience.whole

    // Modal state for Live Demo popups
    const [showModal, setShowModal] = useState(false)
    const [modalMessage, setModalMessage] = useState('')
    const [modalUrl, setModalUrl] = useState('')

    const openModal = (message: string, url: string = '') => {
        setModalMessage(message)
        setModalUrl(url)
        setShowModal(true)
    }

    // Scroll to top functionality
    const [showScrollTop, setShowScrollTop] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollTop(true)
            } else {
                setShowScrollTop(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Scroll to top on page load/reload
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    // Scroll-triggered animations
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate')
                    observer.unobserve(entry.target)
                }
            })
        }, observerOptions)

        // Observe all elements with scroll-animate class
        const animateElements = document.querySelectorAll('.scroll-animate')
        animateElements.forEach((el) => observer.observe(el))

        return () => {
            animateElements.forEach((el) => observer.unobserve(el))
        }
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    // PDF Download functionality
    const cvRef = useRef<HTMLDivElement>(null)
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

    const downloadPDF = async () => {
        const element = cvRef.current
        if (!element) return

        setIsGeneratingPDF(true)

        try {
            // Create a clone of the element to avoid affecting the original
            const clone = element.cloneNode(true) as HTMLElement
            clone.style.position = 'absolute'
            clone.style.left = '-9999px'
            clone.style.top = '0'
            clone.style.width = element.offsetWidth + 'px'
            document.body.appendChild(clone)

            // Remove dark mode classes and force light mode for PDF
            // Also disable animations for PDF
            clone.classList.add('no-animations')
            const allElements = clone.querySelectorAll('*')
            allElements.forEach((el) => {
                const htmlEl = el as HTMLElement
                htmlEl.classList.remove('dark')
                // Remove dark: classes by removing dark mode styles
                if (htmlEl.classList.contains('dark:bg-gray-800')) {
                    htmlEl.classList.remove('dark:bg-gray-800')
                }
                // Remove animation classes
                htmlEl.classList.remove(
                    'animate-fade-in-up',
                    'animate-fade-in',
                    'animate-slide-in-right',
                    'animate-scale-in'
                )
                // Remove scroll-animate class and add animate class to show all content
                if (htmlEl.classList.contains('scroll-animate')) {
                    htmlEl.classList.remove('scroll-animate')
                    htmlEl.classList.add('animate')
                }
                // Remove inline opacity styles that might hide content
                if (htmlEl.style.opacity === '0') {
                    htmlEl.style.opacity = '1'
                }
            })

            // Hide the download button div in the clone
            const downloadBtnDiv = clone.querySelector('.no-print')
            if (downloadBtnDiv) {
                ; (downloadBtnDiv as HTMLElement).style.display = 'none'
            }

            // Also hide any buttons with onclick
            const downloadBtns = clone.querySelectorAll('button[onclick]')
            downloadBtns.forEach((btn) => {
                ; (btn as HTMLElement).style.display = 'none'
            })

            // Wait a bit for styles to apply
            await new Promise((resolve) => setTimeout(resolve, 100))

            // Generate canvas with better options
            const canvas = await html2canvas(clone, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: element.offsetWidth,
                height: element.scrollHeight,
                windowWidth: element.offsetWidth,
                windowHeight: element.scrollHeight,
            } as any)

            // Remove clone from DOM
            document.body.removeChild(clone)

            const imgData = canvas.toDataURL('image/png', 1.0)
            const pdf = new jsPDF('p', 'mm', 'a4')

            // Set margins for better appearance
            const margin = 5 // 5mm margin on all sides
            const pdfWidth = pdf.internal.pageSize.getWidth() - margin * 2
            const pdfHeight = pdf.internal.pageSize.getHeight() - margin * 2
            const imgWidth = canvas.width
            const imgHeight = canvas.height

            // Calculate ratio to fit width with margins
            const ratio = pdfWidth / (imgWidth * 0.264583) // Convert px to mm (1px = 0.264583mm)
            const imgScaledWidth = pdfWidth
            const imgScaledHeight = imgHeight * 0.264583 * ratio

            // Calculate how many pages we need
            let heightLeft = imgScaledHeight
            let position = 0

            // Add first page with margins
            pdf.addImage(imgData, 'PNG', margin, margin + position, imgScaledWidth, imgScaledHeight)
            heightLeft -= pdfHeight

            // Add additional pages if needed
            while (heightLeft > 0) {
                position = heightLeft - imgScaledHeight
                pdf.addPage()
                pdf.addImage(imgData, 'PNG', margin, margin + position, imgScaledWidth, imgScaledHeight)
                heightLeft -= pdfHeight
            }

            pdf.save('Bamaniya-Dinesh-CV.pdf')
            setIsGeneratingPDF(false)
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Error generating PDF. Please try again.')
            setIsGeneratingPDF(false)
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
                <div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-300 dark:border-gray-600"
                    ref={cvRef}
                >
                    {/* Header Section */}
                    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 text-white p-8 md:p-12 animate-fade-in">
                        {/* Top row: Button, Name, Photo */}
                        <div className="flex items-center justify-between mb-6">

                            {/* Photo on left */}
                            <div className="flex-shrink-0">
                                <img
                                    src="/profile-photo.png"
                                    alt="Bamaniya Dinesh"
                                    className="w-20 h-20 md:w-28 md:h-28 rounded-full border-4 border-white shadow-lg object-cover"
                                />
                            </div>
                            {/* Name in center */}
                            <div className="flex-1 text-center">
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                    Bamaniya Dinesh
                                </h1>
                                <p className="text-xl md:text-2xl font-semibold mb-6 text-blue-100">
                                    Full Stack Developer
                                </p>
                            </div>
                            {/* Button on right */}
                            <div className="no-print">
                                <button
                                    onClick={downloadPDF}
                                    disabled={isGeneratingPDF}
                                    className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGeneratingPDF ? (
                                        <>
                                            <svg
                                                className="animate-spin h-5 w-5"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                            Download PDF
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm md:text-base">
                                <a
                                    href="mailto:bamaniyadinesh204@gmail.com"
                                    className="flex items-center gap-2 hover:text-blue-200 transition-colors"
                                >
                                    <span>📧</span>
                                    <span>bamaniyadinesh204@gmail.com</span>
                                </a>
                                <a
                                    href="tel:7096398595"
                                    className="flex items-center gap-2 hover:text-blue-200 transition-colors"
                                >
                                    <span>📱</span>
                                    <span>7096398595</span>
                                </a>
                                <a
                                    href="https://www.linkedin.com/in/dinesh-bamaniya-b9b84a204"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 hover:text-blue-200 transition-colors"
                                >
                                    <span>💼</span>
                                    <span>LinkedIn</span>
                                </a>
                                <span className="flex items-center gap-2">
                                    <span>📍</span>
                                    <span>Ahmedabad, Gujarat</span>
                                </span>
                            </div>
                        </div>
                    </header>

                    <div className="p-8 md:p-12 space-y-10">
                        {/* Objective */}
                        <section className="animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b-4 border-blue-600 inline-block">
                                Objective
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base md:text-lg mt-4">
                                Full-stack developer with {experienceYearsWhole}+ years of experience building
                                scalable web applications using Angular, Node.js, and microservices architecture.
                                Specialized in developing enterprise-level e-commerce platforms and fleet management
                                systems with expertise in multiple databases, cloud services, and modern frontend
                                technologies.
                            </p>
                        </section>

                        {/* Skills */}
                        <section className="scroll-animate">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b-4 border-blue-600 inline-block">
                                Skills
                            </h2>
                            <div className="mt-6 space-y-6">
                                {/* Languages */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Languages
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {['JavaScript', 'TypeScript'].map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-full text-sm md:text-base font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Frontend */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Frontend
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            'Angular',
                                            'React.js',
                                            'TypeScript',
                                            'JavaScript',
                                            'HTML',
                                            'CSS',
                                            'Bootstrap',
                                            'Material UI',
                                            'Tailwind CSS',
                                            'Kendo UI',
                                        ].map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full text-sm md:text-base font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Backend */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Backend
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {['Node.js', 'Express.js', 'Microservices'].map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm md:text-base font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Database */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Database
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {['MySQL', 'PostgreSQL', 'MongoDB', 'AWS RDS', 'Elasticsearch'].map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full text-sm md:text-base font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Tools */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Tools
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {['Docker', 'AWS', 'GitLab', 'GitLab CI/CD', 'GitHub'].map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full text-sm md:text-base font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Experience */}
                        <section className="scroll-animate">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b-4 border-blue-600 inline-block">
                                Work Experience
                            </h2>
                            <div className="mt-6 space-y-6">
                                <div className="relative pl-8 border-l-4 border-blue-500 dark:border-blue-400">
                                    <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6 shadow-md">
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            Full Stack Developer
                                        </h3>
                                        <p className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
                                            iFlair Web Technologies Pvt. Ltd
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400 font-medium mb-4">
                                            <span className="text-gray-500 dark:text-gray-400">10/05/2021 - Present</span>
                                        </p>
                                        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2 text-sm md:text-base">
                                            <li>
                                                Architected and developed 12+ microservices with 100+ RESTful API endpoints,
                                                supporting multi-vendor e-commerce platform used by thousands of users
                                            </li>
                                            <li>
                                                Reduced image processing time by 70% through implementation of queue-based
                                                asynchronous job processing using Bull Queue
                                            </li>
                                            <li>
                                                Integrated 5+ payment gateways (Stripe, PayPal, Razorpay, Mollie, CCAvenue)
                                                with secure transaction handling, processing high-volume transactions
                                            </li>
                                            <li>
                                                Built comprehensive aircraft fleet management system (COSMA) with real-time
                                                dashboard analytics, work order management, and role-based access control
                                                for multi-organization deployments
                                            </li>
                                            <li>
                                                Led frontend development of multiple Angular applications (v16-20) with PWA
                                                and SSR capabilities, improving SEO and user experience
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Projects */}
                        <section className="scroll-animate">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b-4 border-blue-600 inline-block">
                                Projects
                            </h2>
                            <div className="mt-6 space-y-6">
                                {/* SHIRTEE Project */}
                                <div className="scroll-animate bg-gradient-to-br from-white to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-600 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <span className="text-2xl">🛍️</span>
                                            SHIRTEE - Full-Stack E-Commerce Platform
                                        </h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            Angular
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            Node.js
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            Express.js
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            MongoDB
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            MySQL
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            Redis
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            Elasticsearch
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            AWS S3
                                        </span>
                                    </div>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1 text-sm mb-4">
                                        <li>
                                            Architected and developed 12+ microservices with 100+ RESTful API endpoints
                                            supporting multi-vendor marketplace
                                        </li>
                                        <li>
                                            Integrated 5+ payment gateways and implemented queue-based image processing,
                                            reducing processing time by 70%
                                        </li>
                                        <li>
                                            Built PWA with SSR capabilities, real-time notifications, and comprehensive
                                            admin/vendor dashboards
                                        </li>
                                    </ul>
                                    <div className="flex gap-4 text-sm">
                                        <a
                                            href="https://site.shirtee.cloud/en"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                        >
                                            Live Demo
                                        </a>
                                    </div>
                                </div>

                                {/* COSMA Project */}
                                <div className="scroll-animate bg-gradient-to-br from-white to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-600 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <span className="text-2xl">✈️</span>
                                            COSMA - Aircraft Fleet Management System
                                        </h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            Angular 19
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            Node.js
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            Express.js
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            TypeORM
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            MySQL
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            JWT
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            Kendo UI
                                        </span>
                                    </div>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1 text-sm mb-4">
                                        <li>
                                            Developed comprehensive fleet management system with aircraft maintenance,
                                            component tracking, and compliance management
                                        </li>
                                        <li>
                                            Implemented real-time dashboard analytics, work order management, and
                                            role-based access control for multi-organization deployments
                                        </li>
                                        <li>
                                            Integrated Excel import/export, PDF generation, and multi-language support
                                            with RESTful API architecture
                                        </li>
                                    </ul>
                                    <div className="flex gap-4 text-sm">
                                        <button
                                            onClick={() =>
                                                openModal(
                                                    'This project is a middleware service and may require authentication or specific access permissions to view all features.',
                                                    '#'
                                                )
                                            }
                                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                                        >
                                            Live Demo
                                        </button>
                                    </div>
                                </div>

                                {/* MissingLink's Project */}
                                <div className="scroll-animate bg-gradient-to-br from-white to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-600 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <span className="text-2xl">🔗</span>
                                            MissingLink's Middleware
                                        </h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            Node.js
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            React.js
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            MySQL
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            Clio
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            Legalesign
                                        </span>
                                    </div>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1 text-sm mb-4">
                                        <li>
                                            Built middleware service integrating Legalesign and Clio for secure document
                                            sending with customer signatures
                                        </li>
                                        <li>
                                            Implemented automated document retrieval, status updates, and upload
                                            functionality to Clio system
                                        </li>
                                        <li>
                                            Developed React.js interface with search and filter capabilities for document
                                            management
                                        </li>
                                    </ul>
                                    <div className="flex gap-4 text-sm">
                                        <button
                                            onClick={() =>
                                                openModal(
                                                    'This project is a middleware service and may require authentication or specific access permissions to view all features.',
                                                    '#'
                                                )
                                            }
                                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                                        >
                                            Live Demo
                                        </button>
                                    </div>
                                </div>

                                {/* Movie Tickets Booking Project */}
                                <div className="scroll-animate bg-gradient-to-br from-white to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-600 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <span className="text-2xl">🎬</span>
                                            Movie Tickets Booking
                                        </h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            Angular
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            Bootstrap
                                        </span>
                                    </div>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1 text-sm mb-4">
                                        <li>
                                            Designed and implemented user-friendly movie ticket booking platform with
                                            seamless booking experience
                                        </li>
                                        <li>
                                            Implemented seat selection with real-time availability updates and secure
                                            payment processing
                                        </li>
                                        <li>Responsive design ensuring optimal usability across all devices</li>
                                    </ul>

                                    <div className="flex gap-4 text-sm">
                                        <a
                                            href="https://kinobox.si/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                        >
                                            Live Demo
                                        </a>
                                    </div>
                                </div>

                                {/* Credit Card Project */}
                                <div className="scroll-animate bg-gradient-to-br from-white to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-600 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <span className="text-2xl">💳</span>
                                            Credit Card Management System
                                        </h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            Angular
                                        </span>
                                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                                            Bootstrap
                                        </span>
                                    </div>
                                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1 text-sm mb-4">
                                        <li>
                                            Developed sophisticated credit card management system with secure
                                            authentication and encryption protocols
                                        </li>
                                        <li>
                                            Implemented transaction history tracking, spending analysis, and user
                                            preference management
                                        </li>
                                        <li>
                                            Prioritized user privacy and security with responsive design across all
                                            devices
                                        </li>
                                    </ul>
                                    <div className="flex gap-4 text-sm">
                                        <button
                                            onClick={() =>
                                                openModal(
                                                    'This project demo may have limited functionality or require authentication to access all features.',
                                                    '#'
                                                )
                                            }
                                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                                        >
                                            Live Demo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Education */}
                        <section className="scroll-animate">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b-4 border-blue-600 inline-block">
                                Education
                            </h2>
                            <div className="mt-6 space-y-5">
                                <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-5 shadow-md border-l-4 border-indigo-500">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                        B.E. Computer Engineering
                                    </h3>
                                    <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold mb-2">
                                        Om Engineering College, Junagadh
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        <span className="font-semibold">CGPA:</span> 8.52 |{' '}
                                        <span className="font-semibold">Year:</span> 2021
                                    </p>
                                </div>
                                <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-5 shadow-md border-l-4 border-indigo-500">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                        HSC (Higher Secondary Certificate)
                                    </h3>
                                    <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold mb-2">
                                        Samarth International, Junagadh
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        <span className="font-semibold">Percentage:</span> 55.56% |{' '}
                                        <span className="font-semibold">Year:</span> 2017
                                    </p>
                                </div>
                                <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-5 shadow-md border-l-4 border-indigo-500">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                        SSC (Secondary School Certificate)
                                    </h3>
                                    <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold mb-2">
                                        Shree Maruti Vidhyalay Chorvad
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        <span className="font-semibold">Percentage:</span> 73.72% |{' '}
                                        <span className="font-semibold">Year:</span> 2015
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Personal Details */}
                        <section className="scroll-animate">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 pb-2 border-b-4 border-blue-600 inline-block">
                                Personal Details
                            </h2>
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-5 shadow-md">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">👤</span>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                                Full Name
                                            </h3>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Bamaniya Dinesh
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-5 shadow-md">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">📍</span>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                                {' '}
                                                Current Location
                                            </h3>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Ahmedabad, Gujarat, India
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-5 shadow-md">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">📧</span>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                                Email
                                            </h3>
                                            <a
                                                href="mailto:bamaniyadinesh204@gmail.com"
                                                className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                bamaniyadinesh204@gmail.com
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-5 shadow-md">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">📱</span>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                                Phone
                                            </h3>
                                            <a
                                                href="tel:7096398595"
                                                className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                +91 7096398595
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-5 shadow-md">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">💼</span>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                                LinkedIn
                                            </h3>
                                            <a
                                                href="https://www.linkedin.com/in/dinesh-bamaniya-b9b84a204"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                dinesh-bamaniya-b9b84a204
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-5 shadow-md">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">🌐</span>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                                Languages
                                            </h3>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                English, Hindi, Gujarati
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-5 shadow-md">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">💑</span>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                                Marital Status
                                            </h3>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">Married</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-5 shadow-md md:col-span-2">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">🏠</span>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                                Permanent Address
                                            </h3>
                                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                                179, Kukrash Vadi Area, Kukrash - 362265,
                                                <br />
                                                Ta - Veraval, Di - Gir Somnath, Gujarat, India
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {/* Modal for Live Demo popups */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Notice</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
                            >
                                ×
                            </button>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-6">{modalMessage}</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Close
                            </button>
                            {modalUrl && modalUrl !== '#' && (
                                <a
                                    href={modalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Continue to Site
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce hover:animate-none"
                    aria-label="Scroll to top"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                    </svg>
                </button>
            )}
        </main>
    )
}
