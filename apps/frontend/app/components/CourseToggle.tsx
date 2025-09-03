"use client"
import { Course } from "../hooks/course"

interface CourseToggleProps {
  loading: boolean
  setSelectedCourse: (course: Course | undefined) => void
  selectedCourse: Course | undefined
  courses: Course[]
}

export function CourseToggle({ loading, setSelectedCourse, selectedCourse, courses }: CourseToggleProps) {
  if (loading) return <div>Loading...</div>

  return (
    <div>
      <select
        value={selectedCourse?.id || ""}
        onChange={(e) => {
          const selected = courses.find(course => course.id === e.target.value)
          setSelectedCourse(selected)
        }}
      >
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.title}
          </option>
        ))}
      </select>
    </div>
  )
}
