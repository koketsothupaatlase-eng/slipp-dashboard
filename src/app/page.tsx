// Root page — middleware handles redirect to /admin or /merchant based on role.
// This page is only reached if middleware is misconfigured.
import { redirect } from 'next/navigation'
export default function RootPage() { redirect('/login') }
