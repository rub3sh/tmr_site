import { redirect } from 'next/navigation';

export default function OldCoursePlayerPage({
  params,
}: {
  params: { courseId: string };
}) {
  redirect(`/student/courses/${params.courseId}`);
}
