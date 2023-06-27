import React, { useRef } from 'react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-extraneous-dependencies
import { CSVLink } from 'react-csv'
import { Button, Icon } from '@tremor/react'
import { ArrowDownOnSquareIcon } from '@heroicons/react/20/solid'

export interface IProps {
    Headers: any
    Rows: any
    Name: string
}

const Downloader = ({ Headers, Rows, Name }: IProps) => {
    const csvLink = useRef<{ link: { click: () => void } }>()

    const CSVData = () => {
        const csv: any = { headers: [], data: [], fileName: Name }
        for (let i = 0; i < Headers.length; i += 1) {
            csv.headers.push({
                label: Headers[i],
                key: Headers[i],
            })
        }
        for (let i = 0; i < Rows.length; i += 1) {
            const tempArr: any = []
            const finalObj = {}
            for (let j = 0; j < Headers.length; j += 1) {
                tempArr.push({ [Headers[j]]: Rows[i][j] })
            }
            for (let j = 0; j < tempArr.length; j += 1) {
                Object.assign(finalObj, tempArr[j])
            }
            csv.data.push(finalObj)
        }

        return csv
    }

    return (
        <Button onClick={() => csvLink?.current?.link?.click()}>
            {/* <DownloadIcon /> */}
            <Icon icon={ArrowDownOnSquareIcon} />
            <CSVLink
                {...CSVData()}
                style={{ display: 'hidden' }}
                ref={csvLink}
                target="_blank"
            />
        </Button>
    )
}

export default Downloader