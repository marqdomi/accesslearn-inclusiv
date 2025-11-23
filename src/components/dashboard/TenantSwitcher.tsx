import { Buildings, CaretDown } from '@phosphor-icons/react'
import { useTenant } from '@/contexts/TenantContext'
import { useAuth } from '@/contexts/AuthContext'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export function TenantSwitcher() {
    const { currentTenant } = useTenant()
    const { switchTenant } = useAuth()

    if (!currentTenant) {
        return null
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Buildings size={18} />
                    <span className="hidden md:inline">{currentTenant.name}</span>
                    <CaretDown size={14} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Organización Actual</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-2">
                    <p className="text-sm font-medium">{currentTenant.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                        Plan: {currentTenant.plan}
                    </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={switchTenant}>
                    Cambiar de Organización
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
