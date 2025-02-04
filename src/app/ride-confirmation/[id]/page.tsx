import { Suspense } from "react"
import RideConfirmationPage from "./rideconfirmation"

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RideConfirmationPage />
    </Suspense>
  )
}
