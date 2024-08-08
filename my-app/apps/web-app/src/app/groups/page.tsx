"use client"

import { Identity } from "@semaphore-protocol/core"
import { useRouter } from "next/navigation"
import { useCallback, useContext, useEffect, useState } from "react"
import Feedback from "../../../contract-artifacts/Feedback.json"
import Stepper from "@/components/Stepper"
import LogsContext from "@/context/LogsContext"
import SemaphoreContext from "@/context/SemaphoreContext"

declare global {
    interface Window {
      ethereum?: any
    }
}

export default function GroupsPage() {
    const { setLogs } = useContext(LogsContext)
    const router = useRouter()
    const [_loading, setLoading] = useState(false)
    const [_groupName, setGroupName] = useState("")
    const [success, setSuccess] = useState(false)
    const [fail, setFail] = useState(false)

    async function createGroup() {
        if (_groupName === "") return
        setLoading(true)
        let response;
        if (process.env.OPENZEPPELIN_AUTOTASK_WEBHOOK) {
            response = await fetch(process.env.OPENZEPPELIN_AUTOTASK_WEBHOOK, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    groupName: _groupName
                })
            })
        } else {
            response = await fetch("api/group", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    groupName: _groupName
                })
            })
        }

        if (response.status === 200) {
            setLogs("Successfully created group 🤙🏽")
            setSuccess(true)
        } else {
            setLogs("Failed to create group")
            setFail(true)
        }

        setLoading(false)
    }

    return (
        <>
            <h2>Create Group</h2>

            <div>
                <p className="label">Add group</p>
                <input
                    type="text"
                    placeholder="Group name"
                    value={_groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="input"
                />
            </div>

            <div>
                <button
                    className="button"
                    onClick={createGroup}
                    disabled={_loading}
                >
                    <span>Create group</span>
                    {_loading && <div className="loader"></div>}
                </button>
            </div>

            {fail ? (
                <div className="flashy-message fail-message">Failed!</div>
            ) : (
                <></>
            )}

            {success ? (
                <div className="flashy-message success-message">Successful! You created {_groupName}!</div>
            ) : (
                <></>
            )}

            <div className="divider"></div>

            <button className="button-stepper" onClick={() => router.push("/")}>
                Back
            </button>
        </>
    )
}
