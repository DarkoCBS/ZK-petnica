"use client"

import { useRouter } from "next/navigation"

export default function IdentitiesPage() {
    const router = useRouter()

    return (
        <>
            <h2 className="font-size: 3rem;">Welcome to our ZK Platform</h2>

            <p>
               We enable you to verify membership to group without revealing your identity!
            </p>

            <div className="divider"></div>

            <div style={{ display: 'flex' }}>
                <button className="button" onClick={() => router.push("/groups")}>
                    Create group
                </button>

                <button className="button" onClick={() => router.push("/identity")}>
                    Join group
                </button>
            </div>
        </>
    )
}
