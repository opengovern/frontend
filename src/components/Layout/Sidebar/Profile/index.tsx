import { useAuth0 } from '@auth0/auth0-react'
import {
    Card,
    Divider,
    Flex,
    Tab,
    TabGroup,
    TabList,
    Text,
} from '@tremor/react'
import {
    ArrowTopRightOnSquareIcon,
    Bars2Icon,
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { useAtom } from 'jotai/index'
import { useNavigate } from 'react-router-dom'
import { workspaceAtom } from '../../../../store'
import { useWorkspaceApiV1WorkspacesList } from '../../../../api/workspace.gen'
import { GithubComKaytuIoKaytuEnginePkgAuthApiTheme } from '../../../../api/api'
import { applyTheme, currentTheme } from '../../../../utilities/theme'
import { useAuthApiV1UserPreferencesUpdate } from '../../../../api/auth.gen'

interface IProfile {
    isCollapsed: boolean
}

export default function Profile({ isCollapsed }: IProfile) {
    const { user, logout } = useAuth0()
    const [showInfo, setShowInfo] = useState(false)
    const [workspace, setWorkspace] = useAtom(workspaceAtom)
    const wsName = window.location.pathname.split('/')[1]

    const [index, setIndex] = useState(
        // eslint-disable-next-line no-nested-ternary
        currentTheme() === 'system' ? 2 : currentTheme() === 'dark' ? 1 : 0
    )
    const [theme, setTheme] =
        useState<GithubComKaytuIoKaytuEnginePkgAuthApiTheme>(currentTheme())

    const { response, isLoading, isExecuted, error, sendNow } =
        useAuthApiV1UserPreferencesUpdate(
            {
                theme,
            },
            {},
            false
        )
    useEffect(() => {
        if (!isLoading && isExecuted) {
            applyTheme(theme)
        }
    }, [isLoading])
    useEffect(() => {
        switch (index) {
            case 0:
                setTheme(GithubComKaytuIoKaytuEnginePkgAuthApiTheme.ThemeLight)
                sendNow()
                break
            case 1:
                setTheme(GithubComKaytuIoKaytuEnginePkgAuthApiTheme.ThemeDark)
                sendNow()
                break
            case 2:
                setTheme(GithubComKaytuIoKaytuEnginePkgAuthApiTheme.ThemeSystem)
                sendNow()
                break
            default:
                setTheme(GithubComKaytuIoKaytuEnginePkgAuthApiTheme.ThemeLight)
                break
        }
    }, [index])

    const {
        response: workspaceInfo,
        isExecuted: workspaceInfoExecuted,
        sendNow: sendWorkspaceInfo,
    } = useWorkspaceApiV1WorkspacesList({}, false)
    const navigate = useNavigate()

    useEffect(() => {
        if (
            !workspace.current &&
            workspace.list.length < 1 &&
            !workspaceInfoExecuted
        ) {
            sendWorkspaceInfo()
        }
        if (workspace && wsName) {
            if (
                !workspace.current ||
                workspace.list.length < 1 ||
                workspace.current.name !== wsName
            ) {
                const current = workspaceInfo?.filter(
                    (ws) => ws.name === wsName
                )

                setWorkspace({
                    list: workspaceInfo || [],
                    current: current ? current[0] : undefined,
                })
            }
        }
    }, [workspace, workspaceInfo, wsName])

    return (
        <div className="relative w-full mt-4">
            <Flex
                onClick={() => setShowInfo(!showInfo)}
                className={`p-3 rounded-lg cursor-pointer ${
                    isCollapsed ? '!p-1' : 'border border-gray-700'
                }`}
            >
                <Flex className="w-fit gap-3">
                    {user?.picture && (
                        <img
                            className={`${
                                isCollapsed
                                    ? 'h-7 w-7 min-w-5'
                                    : 'h-10 w-10 min-w-10'
                            } rounded-full bg-gray-50`}
                            src={user.picture}
                            alt=""
                        />
                    )}
                    {!isCollapsed && (
                        <Flex flexDirection="col" alignItems="start">
                            <Text className="text-gray-200">{user?.name}</Text>
                            <Text className="text-gray-400">{user?.email}</Text>
                        </Flex>
                    )}
                </Flex>
                {!isCollapsed && (
                    <Bars2Icon className="h-6 w-6 stroke-2 text-gray-400" />
                )}
            </Flex>
            {showInfo && (
                <>
                    <Card
                        className="absolute z-20 bg-kaytu-950 bottom-0 px-4 py-2 w-64 !ring-gray-600"
                        style={{
                            left: 'calc(100% + 20px)',
                        }}
                    >
                        <Flex
                            flexDirection="col"
                            alignItems="start"
                            className="pb-2 mb-1 border-b border-b-gray-700"
                        >
                            <Text className="mb-1">ACCOUNT</Text>
                            <Flex
                                onClick={() =>
                                    navigate(
                                        `/${workspace}/settings?sp=profile`
                                    )
                                }
                                className="py-2 px-5 rounded-md cursor-pointer text-gray-300 hover:text-gray-50 hover:bg-kaytu-800"
                            >
                                <Text className="text-inherit font-semibold">
                                    Profile info
                                </Text>
                            </Flex>
                            <Flex
                                onClick={() => navigate(`/billing`)}
                                className="py-2 px-5 rounded-md cursor-pointer text-gray-300 hover:text-gray-50 hover:bg-kaytu-800"
                            >
                                <Text className="text-inherit font-semibold">
                                    Billing
                                </Text>
                            </Flex>
                            <Flex
                                onClick={() => logout()}
                                className="py-2 px-5 text-gray-300 rounded-md cursor-pointer hover:text-gray-50 hover:bg-kaytu-800"
                            >
                                <Text className="text-inherit font-semibold">
                                    Logout
                                </Text>
                                <ArrowTopRightOnSquareIcon className="w-5 text-gray-400" />
                            </Flex>
                        </Flex>
                        <Flex
                            flexDirection="col"
                            alignItems="start"
                            className="pb-2 mb-1 border-b border-b-gray-700"
                        >
                            <Text className="mt-2 mb-1">WORKSPACES</Text>
                            {workspace.list
                                .filter((ws) => ws.status === 'PROVISIONED')
                                .map((ws) => (
                                    <Flex
                                        onClick={() => navigate(`/${ws.name}`)}
                                        className="py-2 px-5 rounded-md cursor-pointer text-gray-300 hover:text-gray-50 hover:bg-kaytu-800"
                                    >
                                        <Text className="text-inherit font-semibold">
                                            {ws.name}
                                        </Text>
                                    </Flex>
                                ))}
                            <Flex
                                onClick={() => navigate('/workspaces')}
                                className="py-2 px-5 text-gray-300 rounded-md cursor-pointer hover:text-gray-50 hover:bg-kaytu-800"
                            >
                                <Text className="text-inherit font-semibold">
                                    Workspace list
                                </Text>
                                <ArrowTopRightOnSquareIcon className="w-5 text-gray-400" />
                            </Flex>
                        </Flex>
                        <Flex flexDirection="col" alignItems="start">
                            <Text className="my-2">THEME</Text>
                            <TabGroup index={index} onIndexChange={setIndex}>
                                <TabList
                                    variant="solid"
                                    className="w-full bg-kaytu-800"
                                >
                                    <Tab className="w-1/3 flex justify-center text-white">
                                        Light
                                    </Tab>
                                    <Tab className="w-1/3 flex justify-center text-white">
                                        Dark
                                    </Tab>
                                    <Tab className="w-1/3 flex justify-center text-white">
                                        System
                                    </Tab>
                                </TabList>
                            </TabGroup>
                        </Flex>
                    </Card>
                    <Card
                        onClick={() => setShowInfo(false)}
                        className="fixed z-10 w-screen h-screen top-0 left-0 opacity-0"
                    />
                </>
            )}
        </div>
    )
}