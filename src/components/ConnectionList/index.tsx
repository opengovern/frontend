import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, GridOptions, ICellRendererParams } from 'ag-grid-community'
import { Button, Flex, Text } from '@tremor/react'
import { ReactComponent as AzureIcon } from '../../icons/elements-supplemental-provider-logo-azure-new.svg'
import { ReactComponent as AWSIcon } from '../../icons/elements-supplemental-provider-logo-aws-original.svg'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import DrawerPanel from '../DrawerPanel'
import Spinner from '../Spinner'
import { useOnboardApiV1SourcesList } from '../../api/onboard.gen'

interface IConnection {
    id: string
    connector: string
    providerConnectionID: string
    providerConnectionName: string
    lifecycleState: string
    onboardDate: string
    lastInventory: string
}

interface IConnectorList {
    open: boolean
    onClose: any
    connections: any
    loading: boolean
    selectedConnectionsProps: SelectionResult | undefined
}

interface SelectionResult {
    provider: string | undefined
    connections: string[] | undefined
}

const columns: ColDef[] = [
    {
        field: 'connector',
        headerName: 'Connector',
        width: 50,
        sortable: true,
        filter: true,
        cellStyle: { padding: 0 },
        cellRenderer: (params: ICellRendererParams<IConnection>) => {
            return (
                <div className="flex justify-center items-center w-full h-full">
                    {params.data?.connector === 'Azure' ? (
                        <AzureIcon />
                    ) : (
                        <AWSIcon />
                    )}
                </div>
            )
        },
        // checkboxSelection: true,
    },
    {
        field: 'providerConnectionName',
        headerName: 'Name',
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1,
    },
    {
        field: 'providerConnectionID',
        headerName: 'ID',
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1,
    },
    {
        field: 'lifecycleState',
        headerName: 'State',
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1,
    },
    {
        field: 'id',
        headerName: 'Kaytu Connection ID',
        sortable: true,
        filter: true,
        resizable: true,
        hide: true,
        flex: 1,
    },
    {
        field: 'lastInventory',
        headerName: 'Last Inventory',
        sortable: true,
        filter: true,
        resizable: true,
        hide: true,
        flex: 1,
    },
    {
        field: 'onboardDate',
        headerName: 'Onboard Date',
        sortable: true,
        filter: true,
        resizable: true,
        hide: true,
        flex: 1,
    },
]

const tags = [
    { label: 'All', value: 'All' },
    { label: 'AWS', value: 'AWS' },
    { label: 'Azure', value: 'Azure' },
]
const TagIcon = {
    aws: <AWSIcon />,
    azure: <AzureIcon />,
}

export default function ConnectionList({
    open,
    onClose,
    connections,
    selectedConnectionsProps,
    loading,
}: IConnectorList) {
    const gridRef = useRef<AgGridReact<IConnection>>(null)
    const [isConnectionSelected, setIsConnectionSelected] = useState(false)
    const [selectedProvider, setSelectedProvider] = useState({
        label: 'All',
        value: '',
    })

    const updateSelectionByProvider = (api: any, newValue: any) => {
        if (newValue.length) {
            if (newValue === 'All') {
                api?.deselectAll()
                setIsConnectionSelected(false)
                setSelectedProvider({ label: 'All', value: '' })
                return
            }

            api?.forEachNode((node: any) => {
                if (node.data?.connector === newValue) {
                    node.setSelected(true, false, 'checkboxSelected')
                } else {
                    node.setSelected(false, false, 'checkboxSelected')
                }
            })
        }
    }

    const initializeSelectedConnections = (api: any) => {
        if (selectedConnectionsProps === undefined) {
            return
        }

        if (
            selectedConnectionsProps.provider !== undefined &&
            selectedConnectionsProps.provider.length > 0
        ) {
            const selectedTag = tags.find(
                (item) => item.value === selectedConnectionsProps.provider
            )
            if (selectedTag !== undefined) {
                setSelectedProvider(selectedTag)
                updateSelectionByProvider(api, selectedTag.value)
            } else {
                console.error(
                    "couldn't find tag",
                    selectedConnectionsProps.provider
                )
            }
        } else {
            api?.forEachNode((node: any) => {
                const item = selectedConnectionsProps.connections?.find(
                    (data) => data === node.data?.id
                )

                if (item) {
                    node.setSelected(true, false, 'checkboxSelected')
                } else {
                    node.setSelected(false, false, 'checkboxSelected')
                }
            })
        }
    }

    const selectionText = (api: any) => {
        if (api === undefined) {
            return ''
        }

        const conns =
            selectedProvider.value === ''
                ? api.getSelectedNodes().map((data: any) => data.data?.id)
                : []

        if (selectedProvider.value === '') {
            if (conns !== undefined && conns.length > 0) {
                return `${conns.length} connections selected`
            }
        } else {
            return `All ${selectedProvider.value} connections selected`
        }
        return 'All connections are selected'
    }

    const isRowSelectable = useMemo(() => {
        return (rowNode: any) => {
            return rowNode.data
                ? rowNode.data.lifecycleState === 'ONBOARD'
                : false
        }
    }, [])

    const gridOptions: GridOptions<IConnection> = {
        rowData: connections,
        columnDefs: columns,
        pagination: true,
        rowSelection: 'multiple',
        animateRows: true,
        sideBar: {
            toolPanels: [
                {
                    id: 'columns',
                    labelDefault: 'Columns',
                    labelKey: 'columns',
                    iconKey: 'columns',
                    toolPanel: 'agColumnsToolPanel',
                },
                {
                    id: 'filters',
                    labelDefault: 'Filters',
                    labelKey: 'filters',
                    iconKey: 'filter',
                    toolPanel: 'agFiltersToolPanel',
                },
                // {
                //     id: 'customStats',
                //     labelDefault: 'Custom Stats',
                //     labelKey: 'customStats',
                //     // toolPanel: CustomStatsToolPanel,
                // },
            ],
            defaultToolPanel: '',
        },

        onGridReady: (params) => {
            initializeSelectedConnections(params.api)
            setSelectedProvider({ ...selectedProvider })
        },
        onSelectionChanged: (params) => {
            if (params.source === 'checkboxSelected') {
                return
            }

            const selected = params.api.getSelectedNodes()
            if (selected.length > 20) {
                for (let i = 20; i < selected.length; i += 1) {
                    selected.at(i)?.setSelected(false, false)
                }
            }
            setIsConnectionSelected(selected.length > 0)
            setSelectedProvider({ label: 'All', value: '' })
        },
        getRowHeight: (params) => 50,
        isRowSelectable: (rowNode: any) => {
            return rowNode.data
                ? rowNode.data.lifecycleState === 'ONBOARD'
                : false
        },
        getRowStyle: (params: any) => {
            if (params.data.lifecycleState !== 'ONBOARD') {
                return { opacity: 0.4 }
            }
            return { opacity: 1 }
        },
    }

    useEffect(() => {
        updateSelectionByProvider(gridRef.current?.api, selectedProvider.value)
    }, [selectedProvider])

    const handleClose = () => {
        const conns =
            selectedProvider.value === ''
                ? gridRef.current?.api
                      .getSelectedNodes()
                      .map((data) => data.data?.id)
                : []

        onClose({
            provider: selectedProvider.value,
            connections: conns,
        })
    }

    return (
        <DrawerPanel
            open={open}
            onClose={() => handleClose()}
            title="Connections"
        >
            {loading ? (
                <Flex justifyContent="center" className="mt-56">
                    <Spinner />
                </Flex>
            ) : (
                <Flex
                    flexDirection="col"
                    alignItems="start"
                    className="h-full w-full"
                >
                    <Flex justifyContent="start" className="mb-4">
                        {tags.map((tag) => (
                            <Button
                                size="xs"
                                variant={
                                    selectedProvider.label === tag.label &&
                                    !isConnectionSelected
                                        ? 'primary'
                                        : 'secondary'
                                }
                                onClick={() => {
                                    if (selectedProvider === tag)
                                        setSelectedProvider({
                                            label: 'All',
                                            value: '',
                                        })
                                    else setSelectedProvider(tag)
                                }}
                                className="mr-2 w-14"
                            >
                                {tag.label}
                            </Button>
                        ))}
                    </Flex>
                    <Text className="mb-2">
                        {selectionText(gridRef.current?.api)}
                    </Text>
                    <div className="ag-theme-alpine h-full w-full">
                        <AgGridReact
                            ref={gridRef}
                            rowMultiSelectWithClick
                            // domLayout="autoHeight"
                            gridOptions={gridOptions}
                        />
                    </div>
                </Flex>
            )}
        </DrawerPanel>
    )
}