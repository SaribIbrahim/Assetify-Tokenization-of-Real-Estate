import { Flame, MessageCircleWarning, CirclePercent } from "lucide-react"


export const MenuData = [
    {
        id: 1,
        name: 'Dashboard',
        path: '/',
        icon: Flame,
    },
    {
        id: 2,
        name: 'Report Listings',
        path: '/report',
        icon: MessageCircleWarning,
    },
    {
        id: 3,
        name: 'Price Listings',
        path: '/price',
        icon: CirclePercent,
    }
]