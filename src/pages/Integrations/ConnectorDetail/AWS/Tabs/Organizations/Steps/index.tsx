import { Flex, Text } from '@tremor/react'
import { useState } from 'react'
import { CheckIcon } from '@heroicons/react/20/solid'
import FirstStep from './FirstStep'
import SecondStep from './SecondStep'
import ThirdStep from './ThirdStep'
import FinalStep from './FinalStep'

interface ISteps {
    close: any
}

const stepNavigation = (status: string) => {
    switch (status) {
        case 'complete':
            return (
                <>
                    <Flex className="absolute inset-0" aria-hidden="true">
                        <div className="h-0.5 w-full bg-blue-600" />
                    </Flex>
                    <Flex
                        alignItems="center"
                        justifyContent="center"
                        className="relative h-8 w-8 rounded-full bg-blue-600"
                    >
                        <CheckIcon
                            className="h-5 w-5 text-white"
                            aria-hidden="true"
                        />
                    </Flex>
                </>
            )
        case 'current':
            return (
                <>
                    <Flex className="absolute inset-0" aria-hidden="true">
                        <div className="h-0.5 w-full bg-gray-200" />
                    </Flex>
                    <Flex
                        alignItems="center"
                        justifyContent="center"
                        className="relative h-8 w-8 rounded-full border-2 border-blue-600 bg-white"
                        aria-current="step"
                    >
                        <span
                            className="h-2.5 w-2.5 rounded-full bg-blue-600"
                            aria-hidden="true"
                        />
                    </Flex>
                </>
            )
        default:
            return (
                <>
                    <Flex className="absolute inset-0" aria-hidden="true">
                        <div className="h-0.5 w-full bg-gray-200" />
                    </Flex>
                    <Flex
                        alignItems="center"
                        justifyContent="center"
                        className="group relative h-8 w-8 rounded-full border-2 border-gray-300 bg-white"
                    >
                        <span
                            className="h-2.5 w-2.5 rounded-full bg-gray-300"
                            aria-hidden="true"
                        />
                    </Flex>
                </>
            )
    }
}

const getStatus = (current: number, value: number) => {
    switch (true) {
        case current === value:
            return 'current'
        case current < value:
            return 'upcoming'
        default:
            return 'complete'
    }
}

export default function Steps({ close }: ISteps) {
    const [stepNum, setStepNum] = useState(1)
    const [data, setData] = useState({
        accessKey: '',
        secretKey: '',
        roleName: '',
        externalId: '',
    })
    const steps = [
        { name: 'Step 1', status: getStatus(stepNum, 1) },
        { name: 'Step 2', status: getStatus(stepNum, 2) },
        { name: 'Step 3', status: getStatus(stepNum, 3) },
        { name: 'Step 4', status: getStatus(stepNum, 4) },
    ]
    const showStep = (s: number) => {
        switch (s) {
            case 1:
                return (
                    <FirstStep
                        onPrevious={() => close}
                        onNext={() => setStepNum(2)}
                    />
                )
            case 2:
                return (
                    <SecondStep
                        onPrevious={() => setStepNum(1)}
                        onNext={() => setStepNum(3)}
                    />
                )
            case 3:
                return (
                    <ThirdStep
                        onPrevious={() => setStepNum(2)}
                        onNext={(info: any) => {
                            setData(info)
                            setStepNum(4)
                        }}
                    />
                )
            case 4:
                return (
                    <FinalStep
                        data={data}
                        onPrevious={() => setStepNum(3)}
                        onNext={() => setStepNum(4)}
                    />
                )
            default:
                return null
        }
    }
    return (
        <Flex
            flexDirection="col"
            justifyContent="start"
            alignItems="start"
            className="h-full"
        >
            <Text className="my-6">Organization from new AWS account</Text>
            <nav className="w-full">
                <ol className="flex items-center justify-between">
                    {steps.map((step, stepIdx) => (
                        <li
                            key={step.name}
                            className={`${
                                stepIdx !== steps.length - 1 ? 'w-full' : ''
                            } relative`}
                        >
                            {stepNavigation(step.status)}
                        </li>
                    ))}
                </ol>
            </nav>
            {showStep(stepNum)}
        </Flex>
    )
}