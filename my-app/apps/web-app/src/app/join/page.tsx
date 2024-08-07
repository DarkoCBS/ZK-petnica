"use client"

import { Identity } from "@semaphore-protocol/core"
import { useRouter } from "next/navigation"
import { useCallback, useContext, useEffect, useState } from "react"
import Feedback from "../../../contract-artifacts/Feedback.json"
import Stepper from "@/components/Stepper"
import LogsContext from "@/context/LogsContext"
import SemaphoreContext from "@/context/SemaphoreContext"
import Select, { SingleValue } from 'react-select'

declare global {
    interface Window {
      ethereum?: any
    }
}

type GroupType = {
    name: string;
    groupId: string;
}

export default function GroupsPage() {
    const router = useRouter()
    const { setLogs } = useContext(LogsContext)
    const { _users, refreshUsers, addUser } = useContext(SemaphoreContext)
    const [_loading, setLoading] = useState(false)
    const [_identity, setIdentity] = useState<Identity>()
    const [_groups, setGroups] = useState<GroupType[]>([])
    const [selectedGroup, setSelectedGroup] = useState<SingleValue<{value: string, label: string}>>()

    useEffect(() => {
        const privateKey = localStorage.getItem("identity")

        if (!privateKey) {
            router.push("/")
            return
        }

        setIdentity(new Identity(privateKey))
    }, [router])

    useEffect(() => {
        if (_users.length > 0) {
            setLogs(`${_users.length} user${_users.length > 1 ? "s" : ""} retrieved from the group 🤙🏽`)
        }
    }, [_users, setLogs])

    useEffect(() => {
        async function getAllGroups() {
            let response;

            if (process.env.OPENZEPPELIN_AUTOTASK_WEBHOOK) {
                response = await fetch(process.env.OPENZEPPELIN_AUTOTASK_WEBHOOK, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                })
            } else {
                response = await fetch("api/group", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                })
            }

            let res = await response.json()
            if (res.data) setGroups(res.data)
        }

        getAllGroups()
    }, [])

    const joinGroup = useCallback(async () => {
        if (!_identity) {
            return
        }

        setLoading(true)
        setLogs(`Joining the Feedback group...`)

        let response: any

        if (process.env.OPENZEPPELIN_AUTOTASK_WEBHOOK) {
            response = await fetch(process.env.OPENZEPPELIN_AUTOTASK_WEBHOOK, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    abi: Feedback.abi,
                    address: process.env.FEEDBACK_CONTRACT_ADDRESS,
                    functionName: "joinGroup",
                    functionParameters: [_identity.commitment.toString()]
                })
            })
        } else {
            response = await fetch("api/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    identityCommitment: _identity.commitment.toString(),
                    groupId: selectedGroup?.value,
                })
            })
        }

        if (response.status === 200) {
            addUser(_identity.commitment.toString())

            setLogs(`You have joined the Feedback group event 🎉 Share your feedback anonymously!`)
        } else {
            setLogs("Some error occurred, please try again!")
        }

        setLoading(false)
    }, [_identity, addUser, setLogs, selectedGroup?.value])

    const userHasJoined = useCallback((identity: Identity) => _users.includes(identity.commitment.toString()), [_users])

    return (
        <>
            <h2>Available Events</h2>

            <div className="divider"></div>

            <div>
                <Select
                    options={_groups.map((group) => ({label: group.name, value: group.groupId }))}
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e)}
                    isMulti={false}
                />
            </div>

            <div>
                <button
                    className="button"
                    onClick={joinGroup}
                    disabled={_loading || !_identity || !selectedGroup?.value}
                >
                    <span>Join group</span>
                    {_loading && <div className="loader"></div>}
                </button>
            </div>

            {/* {_users.length > 0 && (
                <div>
                    {_users.map((user, i) => (
                        <div key={i}>
                            <p className="box box-text">{user.toString()}</p>
                        </div>
                    ))}
                </div>
            )} */}

            <div className="divider"></div>

            <Stepper
                step={2}
                onPrevClick={() => router.push("/identity")}
                onNextClick={_identity && userHasJoined(_identity) ? () => router.push(`/proofs/generate/${selectedGroup?.value}`) : undefined}
            />
        </>
    )
}
