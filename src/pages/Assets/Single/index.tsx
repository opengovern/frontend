import { useAtomValue } from 'jotai'
import { useLocation, useParams } from 'react-router-dom'
import { timeAtom } from '../../../store'
import SingleConnection from './SingleConnection'
import NotFound from '../../Errors'
import SingleMetric from './SingleMetric'
import Menu from '../../../components/Menu'

export default function Single() {
    const activeTimeRange = useAtomValue(timeAtom)
    const { id } = useParams()
    const { hash } = useLocation()

    const renderPage = () => {
        switch (hash) {
            case '#account':
                return (
                    <SingleConnection
                        activeTimeRange={activeTimeRange}
                        id={id}
                    />
                )
            case '#metric':
                return (
                    <SingleMetric activeTimeRange={activeTimeRange} id={id} />
                )
            default:
                return <NotFound />
        }
    }

    return <Menu currentPage="assets">{renderPage()}</Menu>
}