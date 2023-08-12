import { ChevronDownIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { Flex, Title } from '@tremor/react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import CLIMenu from '../CLIMenu'

interface IHeader {
    workspace: string | undefined
}

export default function Header({ workspace }: IHeader) {
    const { user, logout } = useAuth0()
    const [theme, setTheme] = useState(localStorage.theme || 'dark')

    const toggleTheme = () => {
        if (localStorage.theme === 'dark') {
            setTheme('light')
            localStorage.theme = 'light'
        } else {
            setTheme('dark')
            localStorage.theme = 'dark'
        }

        if (
            localStorage.theme === 'dark' ||
            (!('theme' in localStorage) &&
                window.matchMedia('(prefers-color-scheme: dark)').matches)
        ) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }
    return (
        <div className="px-12 absolute top-2 w-full flex h-16 items-center justify-center gap-x-4 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 shadow-sm rounded-tl-2xl">
            <Flex className="max-w-8xl">
                <div className="text-gray-900">
                    <Title>
                        &#128075; Welcome back,{' '}
                        {user?.given_name || user?.email || ''}
                    </Title>
                </div>
                <div className="h-6 w-px bg-gray-900/10 dark:bg-white/20 lg:hidden" />
                <div className="flex flex-1 justify-end gap-x-4 self-stretch lg:gap-x-6">
                    <div className="flex items-center gap-x-4 lg:gap-x-6">
                        <button
                            type="button"
                            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
                            onClick={toggleTheme}
                        >
                            <span className="sr-only">Theme</span>
                            {theme === 'dark' ? (
                                <SunIcon className="h-6 w-6" />
                            ) : (
                                <MoonIcon className="h-6 w-6" />
                            )}
                        </button>
                        <CLIMenu />
                        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-900/10 lg:dark:bg-white/20" />
                        {/* Profile dropdown */}
                        <Menu as="div" className="relative">
                            <Menu.Button className="-m-1.5 flex items-center p-1.5">
                                {user?.picture && (
                                    <img
                                        className="h-8 w-8 min-w-8 rounded-full bg-gray-50"
                                        src={user.picture}
                                        alt=""
                                    />
                                )}

                                <span className="hidden lg:flex lg:items-center">
                                    <span className="ml-4 text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
                                        {user?.name || user?.email || ''}
                                    </span>
                                    <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" />
                                </span>
                            </Menu.Button>
                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white dark:bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                                    <Menu.Item key="Your profile">
                                        {({ active }) => (
                                            <Link
                                                to={`/${workspace}/settings/profile`}
                                                className={`
                                                    ${
                                                        active
                                                            ? 'bg-gray-50'
                                                            : ''
                                                    }
                                                    'block px-3 py-1 text-sm leading-6 text-gray-900'
                                                `}
                                            >
                                                Your profile
                                            </Link>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item key="Sign out">
                                        {({ active }) => (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    logout()
                                                }}
                                                className={`
                                                    ${
                                                        active
                                                            ? 'bg-gray-50'
                                                            : ''
                                                    }
                                                    'block px-3 py-1 text-sm leading-6 text-gray-900'
                                                `}
                                            >
                                                Sign out
                                            </button>
                                        )}
                                    </Menu.Item>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                </div>
            </Flex>
        </div>
    )
}