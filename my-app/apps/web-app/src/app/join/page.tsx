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
    const [success, setSuccess] = useState(false)
    const [fail, setFail] = useState(false)

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
            // setLogs(`${_users.length} user${_users.length > 1 ? "s" : ""} retrieved from the group 🤙🏽`)
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
        setLogs(`Joining group...`)

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
            setSuccess(true)
            setFail(false)

            setLogs(`You have joined the event! 🎉`)
        } else {
            setLogs("Some error occurred, please try again!")
            setFail(true)
            setSuccess(false)
        }

        setLoading(false)
    }, [_identity, addUser, setLogs, selectedGroup?.value])

    const userHasJoined = useCallback((identity: Identity) => _users.includes(identity.commitment.toString()), [_users])

    const customStyles = {
        control: (provided: any) => ({
            ...provided,
            backgroundColor: 'var(--slate100)',
            borderColor: 'var(--slate500)',
            color: 'var(--slate700)',
        }),
        menu: (provided: any) => ({
            ...provided,
            backgroundColor: 'var(--slate100)',
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected ? 'var(--slate300)' : 'var(--slate100)',
            color: 'var(--slate700)',
            '&:hover': {
                backgroundColor: 'var(--slate200)',
            },
        }),
        singleValue: (provided: any) => ({
            ...provided,
            color: 'var(--slate700)',
        }),
    }
    
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
                    styles={customStyles}
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

            {fail ? (
                <div className="flashy-message fail-message">Failed! You are already in this group!</div>
            ) : (
                <></>
            )}

            {success ? (
                <div className="flashy-message success-message">Successful! You are now part of {selectedGroup?.label}!</div>
            ) : (
                <></>
            )}

            <div className="divider"></div>

            <Stepper
                step={2}
                onPrevClick={() => router.push("/identity")}
                onNextClick={_identity && userHasJoined(_identity) ? () => router.push(`/proofs/generate/${selectedGroup?.value}`) : undefined}
            />
        </>
    )
}
