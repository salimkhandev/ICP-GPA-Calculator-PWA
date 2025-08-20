import React, { useState, useEffect } from "react";

const SGPACalculator = () => {
  const [courses, setCourses] = useState([]);
  const [result, setResult] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // Initialize with one course
  useEffect(() => {
    addCourse();
  }, []);

  // PWA Installation logic
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("✅ Service Worker Registered"))
        .catch((err) => console.error("❌ SW Error:", err));
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("User choice:", outcome);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const addCourse = () => {
    const newCourse = {
      id: Date.now(),
      credits: "",
      gpa: "",
    };
    setCourses((prev) => [...prev, newCourse]);
  };

  const removeCourse = (courseId) => {
    setCourses((prev) => prev.filter((course) => course.id !== courseId));
  };

  const updateCourse = (courseId, field, value) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId ? { ...course, [field]: value } : course
      )
    );
  };

  const getGradeCategory = (sgpa) => {
    if (sgpa >= 3.7) return "Excellent";
    if (sgpa >= 3.0) return "Good";
    if (sgpa >= 2.0) return "Satisfactory";
    if (sgpa >= 1.0) return "Pass";
    return "Fail";
  };

  const calculateSGPA = () => {
    if (courses.length === 0) {
      alert("Please add at least one course to calculate SGPA!");
      return;
    }

    let totalWeightedGPA = 0;
    let totalCredits = 0;
    let validCourses = 0;

    courses.forEach((course) => {
      const credits = parseFloat(course.credits);
      const gpa = parseFloat(course.gpa);

      if (credits && gpa >= 0 && gpa <= 4) {
        totalWeightedGPA += gpa * credits;
        totalCredits += credits;
        validCourses++;
      }
    });

    if (validCourses === 0) {
      alert("Please fill in all course details correctly!");
      return;
    }

    const sgpa = totalWeightedGPA / totalCredits;

    setResult({
      sgpa: sgpa.toFixed(2),
      totalCredits,
      totalCourses: validCourses,
      gradeCategory: getGradeCategory(sgpa),
    });
  };

  const clearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all courses? This action cannot be undone."
      )
    ) {
      setCourses([]);
      setResult(null);
      setTimeout(addCourse, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-purple-700 p-2 sm:p-5">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 sm:p-8 text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/assets/logo.png"
              alt="SGPA Calculator Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            SGPA Calculator
          </h1>
          <p className="text-lg opacity-90">
            Calculate your Semester Grade Point Average
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {/* Install Prompt */}
          {showInstallPrompt && (
            <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900 p-4 rounded-xl mb-6 text-center">
              <strong>📱 Install App</strong>
              <br />
              Add this calculator to your home screen for quick access!
              <br />
              <button
                onClick={installApp}
                className="bg-amber-900 text-white px-5 py-2 rounded-lg mt-3 font-semibold hover:bg-amber-800 transition-colors"
              >
                Install Now
              </button>
            </div>
          )}

          {/* Add Course Button */}
          <button
            onClick={addCourse}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-4 px-6 rounded-xl mb-6 text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            ➕ Add Course
          </button>

          {/* Courses */}
          <div className="space-y-4 mb-6">
            {courses.map((course, index) => (
              <div
                key={course.id}
                className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 hover:border-indigo-500 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-indigo-600">
                    Course {index + 1}
                  </h3>
                  <button
                    onClick={() => removeCourse(course.id)}
                    className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold hover:bg-red-600 transition-colors"
                    title="Remove Course"
                  >
                    ×
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Credit Hours
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      step="1"
                      placeholder="e.g., 3"
                      value={course.credits}
                      onChange={(e) =>
                        updateCourse(course.id, "credits", e.target.value)
                      }
                      className="w-full p-3 border-2 border-gray-300 rounded-xl text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Grade Point (GPA)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="4"
                      step="0.01"
                      placeholder="e.g., 3.75"
                      value={course.gpa}
                      onChange={(e) =>
                        updateCourse(course.id, "gpa", e.target.value)
                      }
                      className="w-full p-3 border-2 border-gray-300 rounded-xl text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-colors"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateSGPA}
            disabled={courses.length === 0}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-5 px-6 rounded-xl mb-8 text-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            🧮 Calculate SGPA
          </button>

          {/* Result */}
          {result && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-sky-500 rounded-2xl p-6 mb-6 text-center animate-fadeIn">
              <h3 className="text-xl font-semibold text-sky-700 mb-3">
                📈 Your SGPA Result
              </h3>
              <div className="text-5xl sm:text-6xl font-black text-blue-600 my-4">
                {result.sgpa}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="text-2xl font-bold text-indigo-600">
                    {result.totalCredits}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total Credits</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="text-2xl font-bold text-indigo-600">
                    {result.totalCourses}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Courses</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm col-span-2 sm:col-span-1">
                  <div className="text-2xl font-bold text-indigo-600">
                    {result.gradeCategory}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Grade Category
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Clear Button */}
          <button
            onClick={clearAll}
            className="w-full bg-red-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-red-600 transition-colors"
          >
            🗑️ Clear All Courses
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SGPACalculator;
