import { Suspense } from "react"
import AvailableDriversClient from "./availableDriversPage"

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AvailableDriversClient />
    </Suspense>
  )
}
