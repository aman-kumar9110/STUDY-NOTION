import React, { useEffect, useState } from "react"
import { BiInfoCircle } from "react-icons/bi"
import { HiOutlineGlobeAlt } from "react-icons/hi"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import ConfirmationModal from "../Component/Common/ConfirmationModal"
import Footer from "../Component/Common/Footer"
import RatingStars from "../Component/Common/RatingStars"
import CourseAccordionBar from "../Component/Core/Course/CourseAccordionBar"
import CourseDetailsCard from "../Component/Core/Course/CourseDetailsCard"
import { formatDate } from "../Service/formatDate"
import { fetchCourseDetails } from "../Service/Operation/courseDetailsAPI"
import { BuyCourse } from "../Service/Operation/studentFeaturesAPI"
import GetAvgRating from "../Util/avgRating"
import Error from "./Error"

function CourseDetails() {
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  const { loading } = useSelector((state) => state.profile)
  const { paymentLoading } = useSelector((state) => state.course)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { courseId } = useParams()

  const [response, setResponse] = useState(null)
  const [confirmationModal, setConfirmationModal] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchCourseDetails(courseId)
        if (res?.success) {
          setResponse(res)
        } else {
          setResponse(null)
        }
      } catch (error) {
        console.error("Could not fetch Course Details", error)
      }
    })()
  }, [courseId])



  const [avgReviewCount, setAvgReviewCount] = useState(0)
  useEffect(() => {
    if (response?.data?.courseDetails?.ratingAndReviews) {
      const count = GetAvgRating(response.data.courseDetails.ratingAndReviews)
      setAvgReviewCount(count)
    }
  }, [response])


  const [totalNoOfLectures, setTotalNoOfLectures] = useState(0)
  useEffect(() => {
    let lectures = 0
    response?.data?.courseDetails?.courseContent?.forEach((sec) => {
      lectures += sec?.subSection?.length || 0
    })
    setTotalNoOfLectures(lectures)
  }, [response])



const [isActive, setIsActive] = useState(Array(0))
  const handleActive = (id) => {

    setIsActive(
      !isActive.includes(id)
        ? isActive.concat([id])
        : isActive.filter((e) => e != id)
    )
  }


  const handleBuyCourse = () => {
    if (token) {
      BuyCourse(token, [courseId], user, navigate, dispatch)
      return
    }
    setConfirmationModal({
      text1: "You are not logged in!",
      text2: "Please login to Purchase Course.",
      btn1Text: "Login",
      btn2Text: "Cancel",
      btn1Handler: () => navigate("/login"),
      btn2Handler: () => setConfirmationModal(null),
    })
  }

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "N/A"
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${hrs}h ${mins}m`
  }

  if (loading || !response) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="animate-spin h-10 w-10 border-4 border-yellow-200 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!response?.success) {
    return <Error />
  }

  const {
    _id: course_id,
    courseName,
    courseDescription,
    thumbnail,
    price,
    whatYouWillLearn,
    courseContent,
    ratingAndReviews,
    instructor,
    studentsEnrolled,
    createdAt,
  } = response.data?.courseDetails

  if (paymentLoading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="animate-spin h-10 w-10 border-4 border-yellow-200 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <>
      <div className="relative w-full bg-richblack-800">
        {/* Hero Section */}
        <div className="mx-auto box-content px-4 lg:w-[1260px] 2xl:relative">
          <div className="mx-auto grid min-h-[450px] max-w-maxContentTab justify-items-center py-8 lg:mx-0 lg:justify-items-start lg:py-0 xl:max-w-[810px]">
            <div className="relative block max-h-[30rem] lg:hidden">
              <div className="absolute bottom-0 left-0 h-full w-full shadow-[#161D29_0px_-64px_36px_-28px_inset]"></div>
              <img
                src={thumbnail}
                alt="course thumbnail"
                className="aspect-auto w-full"
              />
            </div>
            <div className="z-30 my-5 flex flex-col justify-center gap-4 py-5 text-lg text-richblack-5">
              <p className="text-4xl font-bold text-richblack-5 sm:text-[42px] tracking-wider text-center lg:text-left">
                {courseName || "Untitled Course"}
              </p>

              <ul className="text-richblack-200 space-y-1 list-none">
                {courseDescription?.split("\n")?.map((line, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">{index + 1}.</span>
                    <span>{line.includes(".") ? line.split(".").slice(1).join(".").trim() : line.trim()}</span>
                  </li>
                ))}
              </ul>

              <div className="text-md flex flex-wrap items-center gap-2 justify-center lg:justify-start">
                <span className="text-yellow-25">{avgReviewCount}</span>
                <RatingStars Review_Count={avgReviewCount} Star_Size={24} />
                <span>({ratingAndReviews?.length || 0} reviews)</span>
                <span>{studentsEnrolled?.length || 0} students enrolled</span>
              </div>
              <p>Created By {`${instructor?.firstName} ${instructor?.lastName}`}</p>
              <div className="flex flex-wrap gap-5 text-lg">
                <p className="flex items-center gap-2">
                  <BiInfoCircle /> Created at {createdAt ? formatDate(createdAt) : "N/A"}
                </p>
                <p className="flex items-center gap-2">
                  <HiOutlineGlobeAlt /> English
                </p>
              </div>
            </div>

            {/* Mobile Price + Buttons */}
            <div className="flex w-full flex-col gap-4 border-y border-y-richblack-500 py-4 lg:hidden">
              <p className="text-3xl font-semibold text-richblack-5">Rs. {price}</p>
              <button className="yellowButton uppercase tracking-wider" onClick={handleBuyCourse}>
                Buy Now
              </button>
              <button className="blackButton uppercase tracking-wider" disabled>
                Add to Cart
              </button>
            </div>
          </div>

          {/* Desktop Card */}
          <div className="right-[1rem] top-[60px] mx-auto hidden min-h-[600px] w-1/3 max-w-[410px] translate-y-24 md:translate-y-0 lg:absolute lg:block">
            <CourseDetailsCard
              course={response?.data?.courseDetails}
              setConfirmationModal={setConfirmationModal}
              handleBuyCourse={handleBuyCourse}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto box-content px-4 text-richblack-5 lg:w-[1260px]">
        <div className="mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[810px]">
          {/* Learn Section */}
          <div className="my-8 border border-richblack-600 p-8">
            <p className="text-3xl font-semibold uppercase tracking-wider">What you'll Learn?</p>
            <ul className="mt-5 leading-relaxed list-none space-y-2">
              {whatYouWillLearn?.split("\n")?.map((line, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">{index + 1}.</span>
                  <span>{line.includes(".") ? line.split(".").slice(1).join(".").trim() : line.trim()}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Course Content Section */}
          <div className="max-w-[830px]">
            <div className="flex flex-col gap-3">
              <p className="text-[28px] font-semibold uppercase tracking-wider">Course Content</p>
              <div className="flex flex-wrap justify-between gap-2">
                <div className="flex gap-2 tracking-wide">
                  <span>{courseContent?.length || 0} section(s)</span>
                  <span>{totalNoOfLectures || 0} lecture(s)</span>
                  <span>{formatDuration(response?.data?.totalDuration)}</span>
                </div>
                <button className="text-yellow-25" onClick={() => setIsActive([])}>Collapse all sections</button>
              </div>
            </div>

            <div className="py-4">
              {courseContent?.map((course) => (
                <CourseAccordionBar
                  key={course._id}
                  course={course}
                  isActive={isActive}
                  handleActive={handleActive}
                />
              ))}
            </div>

            {/* Author Section */}
            <div className="mb-12 py-4">
              <p className="text-[28px] font-semibold">Author</p>
              <div className="flex items-center gap-4 py-4">
                <img
                  src={
                    instructor?.image
                      ? instructor.image
                      : `https://api.dicebear.com/5.x/initials/svg?seed=${instructor?.firstName} ${instructor?.lastName}`
                  }
                  alt="Author"
                  className="h-14 w-14 rounded-full object-cover"
                />
                <p className="text-lg">{`${instructor?.firstName} ${instructor?.lastName}`}</p>
              </div>
              <p className="text-richblack-50">
                {instructor?.additionalDetails?.about}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  )
}

export default CourseDetails
