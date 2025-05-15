"use client"

import { useState } from "react"
import {
  Users,
  UserCircle,
  GraduationCap,
  ClipboardCheck,
  Calendar,
  BookOpen,
  BarChart3,
  FileText,
  MessageSquare,
  Settings,
} from "lucide-react"

export default function ERPSystemShowcase() {
  const [activeTab, setActiveTab] = useState("attendance")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">Educational ERP System</h1>
        <p className="mt-4 text-gray-600 md:text-lg">A comprehensive solution for managing educational institutions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Student Card */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-white/20 p-2">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                Student Portal
              </span>
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold">Student Dashboard</h3>
            <p className="text-sm text-gray-600">Access to attendance, grades, and course materials</p>
          </div>
          <div className="space-y-4 px-5 pb-5">
            <div className="rounded-lg bg-gray-100 p-3">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Attendance Tracking</p>
                  <p className="text-sm text-gray-600">View your attendance records</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-gray-100 p-3">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Course Materials</p>
                  <p className="text-sm text-gray-600">Access study materials and assignments</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-gray-100 p-3">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Grade Reports</p>
                  <p className="text-sm text-gray-600">Check your academic performance</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher Card */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-white/20 p-2">
                <UserCircle className="h-6 w-6 text-white" />
              </div>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-green-600">
                Teacher Portal
              </span>
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold">Teacher Dashboard</h3>
            <p className="text-sm text-gray-600">Tools for managing classes, attendance, and grading</p>
          </div>
          <div className="space-y-4 px-5 pb-5">
            <div className="rounded-lg bg-gray-100 p-3">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Attendance Management</p>
                  <p className="text-sm text-gray-600">Mark and track student attendance</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-gray-100 p-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Assignment Grading</p>
                  <p className="text-sm text-gray-600">Grade assignments and provide feedback</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-gray-100 p-3">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Communication</p>
                  <p className="text-sm text-gray-600">Message students and parents</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Card */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-white/20 p-2">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-purple-600">
                Admin Portal
              </span>
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold">Admin Dashboard</h3>
            <p className="text-sm text-gray-600">Complete control over the entire institution</p>
          </div>
          <div className="space-y-4 px-5 pb-5">
            <div className="rounded-lg bg-gray-100 p-3">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">User Management</p>
                  <p className="text-sm text-gray-600">Manage students, teachers, and staff</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-gray-100 p-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Scheduling</p>
                  <p className="text-sm text-gray-600">Create and manage class schedules</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-gray-100 p-3">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">System Configuration</p>
                  <p className="text-sm text-gray-600">Configure system settings and permissions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold">Key Features</h2>

        {/* Custom Tabs with Tailwind */}
        <div className="w-full">
          {/* Tab List */}
          <div className="grid w-full grid-cols-1 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 md:grid-cols-4">
            <button
              onClick={() => setActiveTab("attendance")}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "attendance" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => setActiveTab("grading")}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "grading" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Grading
            </button>
            <button
              onClick={() => setActiveTab("communication")}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "communication" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Communication
            </button>
            <button
              onClick={() => setActiveTab("reporting")}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === "reporting" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Reporting
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {/* Attendance Tab */}
            {activeTab === "attendance" && (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-xl font-semibold">Attendance Management</h3>
                  <p className="mt-2 text-gray-600">
                    Our ERP system provides comprehensive attendance tracking for educational institutions.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-green-100 p-1">
                        <ClipboardCheck className="h-4 w-4 text-green-600" />
                      </div>
                      <span>Real-time attendance marking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-green-100 p-1">
                        <ClipboardCheck className="h-4 w-4 text-green-600" />
                      </div>
                      <span>Automated absence notifications</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-green-100 p-1">
                        <ClipboardCheck className="h-4 w-4 text-green-600" />
                      </div>
                      <span>Attendance reports and analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-green-100 p-1">
                        <ClipboardCheck className="h-4 w-4 text-green-600" />
                      </div>
                      <span>Multiple marking methods (QR, biometric, manual)</span>
                    </li>
                  </ul>
                  <button className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Learn More
                  </button>
                </div>
                <div className="rounded-lg bg-gray-100 p-4">
                  <div className="rounded-md bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-medium">Class Attendance</h4>
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                        Today
                      </span>
                    </div>
                    <div className="space-y-3">
                      {["John Smith", "Maria Garcia", "Ahmed Khan", "Sarah Johnson"].map((name, i) => (
                        <div key={i} className="flex items-center justify-between rounded-md border p-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                            <span>{name}</span>
                          </div>
                          <span
                            className={`rounded-full px-3 py-0.5 text-xs font-medium ${
                              i === 2 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {i === 2 ? "Absent" : "Present"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grading Tab */}
            {activeTab === "grading" && (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-xl font-semibold">Grading System</h3>
                  <p className="mt-2 text-gray-600">
                    Comprehensive grading tools for teachers with detailed analytics for students and parents.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-blue-100 p-1">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                      </div>
                      <span>Customizable grading scales</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-blue-100 p-1">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                      </div>
                      <span>Performance analytics and trends</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-blue-100 p-1">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                      </div>
                      <span>Automated grade calculations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-blue-100 p-1">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                      </div>
                      <span>Detailed feedback system</span>
                    </li>
                  </ul>
                  <button className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Learn More
                  </button>
                </div>
                <div className="rounded-lg bg-gray-100 p-4">
                  <div className="rounded-md bg-white p-4 shadow-sm">
                    <div className="mb-4">
                      <h4 className="font-medium">Student Grade Report</h4>
                      <p className="text-sm text-gray-600">Mathematics - Spring 2025</p>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2 rounded-md border p-2">
                        <div>
                          <p className="text-sm text-gray-600">Quiz 1</p>
                          <p className="font-medium">85%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Midterm</p>
                          <p className="font-medium">92%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Final</p>
                          <p className="font-medium">88%</p>
                        </div>
                      </div>
                      <div className="rounded-md border p-2">
                        <p className="text-sm text-gray-600">Overall Grade</p>
                        <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                          <div className="h-2 w-[89%] rounded-full bg-green-500"></div>
                        </div>
                        <p className="mt-1 font-medium">A- (89%)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Communication Tab */}
            {activeTab === "communication" && (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-xl font-semibold">Communication Tools</h3>
                  <p className="mt-2 text-gray-600">
                    Integrated messaging system connecting students, teachers, and parents.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-purple-100 p-1">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                      </div>
                      <span>Direct messaging between users</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-purple-100 p-1">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                      </div>
                      <span>Announcement broadcasts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-purple-100 p-1">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                      </div>
                      <span>File sharing capabilities</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-purple-100 p-1">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                      </div>
                      <span>Email and SMS notifications</span>
                    </li>
                  </ul>
                  <button className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Learn More
                  </button>
                </div>
                <div className="rounded-lg bg-gray-100 p-4">
                  <div className="rounded-md bg-white p-4 shadow-sm">
                    <div className="mb-4">
                      <h4 className="font-medium">Messages</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="rounded-md border p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                          <div>
                            <p className="font-medium">Prof. Williams</p>
                            <p className="text-xs text-gray-600">2 hours ago</p>
                          </div>
                        </div>
                        <p className="mt-2 text-sm">
                          Don't forget to submit your assignment by Friday. Let me know if you have any questions.
                        </p>
                      </div>
                      <div className="rounded-md border p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                          <div>
                            <p className="font-medium">Admin Office</p>
                            <p className="text-xs text-gray-600">Yesterday</p>
                          </div>
                        </div>
                        <p className="mt-2 text-sm">
                          Important: Schedule changes for next week. Please check your updated timetable.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reporting Tab */}
            {activeTab === "reporting" && (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-xl font-semibold">Reporting & Analytics</h3>
                  <p className="mt-2 text-gray-600">Comprehensive reporting tools for data-driven decision making.</p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-amber-100 p-1">
                        <BarChart3 className="h-4 w-4 text-amber-600" />
                      </div>
                      <span>Customizable report generation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-amber-100 p-1">
                        <BarChart3 className="h-4 w-4 text-amber-600" />
                      </div>
                      <span>Performance trend analysis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-amber-100 p-1">
                        <BarChart3 className="h-4 w-4 text-amber-600" />
                      </div>
                      <span>Attendance and grade correlations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-amber-100 p-1">
                        <BarChart3 className="h-4 w-4 text-amber-600" />
                      </div>
                      <span>Exportable data in multiple formats</span>
                    </li>
                  </ul>
                  <button className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    Learn More
                  </button>
                </div>
                <div className="rounded-lg bg-gray-100 p-4">
                  <div className="rounded-md bg-white p-4 shadow-sm">
                    <div className="mb-4">
                      <h4 className="font-medium">Class Performance Overview</h4>
                      <p className="text-sm text-gray-600">Physics 101 - Spring 2025</p>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-md border p-3">
                          <p className="text-sm text-gray-600">Average Grade</p>
                          <p className="text-2xl font-bold">83%</p>
                          <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                            <div className="h-2 w-[83%] rounded-full bg-blue-500"></div>
                          </div>
                        </div>
                        <div className="rounded-md border p-3">
                          <p className="text-sm text-gray-600">Attendance Rate</p>
                          <p className="text-2xl font-bold">91%</p>
                          <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
                            <div className="h-2 w-[91%] rounded-full bg-green-500"></div>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-md border p-3">
                        <p className="mb-2 text-sm text-gray-600">Grade Distribution</p>
                        <div className="flex h-24 items-end gap-1">
                          <div className="h-[15%] w-full bg-blue-200"></div>
                          <div className="h-[25%] w-full bg-blue-300"></div>
                          <div className="h-[40%] w-full bg-blue-400"></div>
                          <div className="h-[80%] w-full bg-blue-500"></div>
                          <div className="h-[60%] w-full bg-blue-600"></div>
                        </div>
                        <div className="mt-1 flex justify-between text-xs text-gray-600">
                          <span>F</span>
                          <span>D</span>
                          <span>C</span>
                          <span>B</span>
                          <span>A</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-lg bg-gray-100 p-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <h3 className="text-xl font-semibold">Ready to transform your educational institution?</h3>
            <p className="mt-2 text-gray-600">
              Our ERP system provides everything you need to manage your school or university efficiently.
            </p>
          </div>
          <button className="w-full rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:w-auto">
            Request a Demo
          </button>
        </div>
      </div>
    </div>
  )
}
