/**
 * Impersonation Banner
 * Shows a persistent banner when super-admin is impersonating a user
 */
import { AlertTriangle, X, Eye, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useImpersonation } from '@/contexts/ImpersonationContext'
import { cn } from '@/lib/utils'

interface ImpersonationBannerProps {
  className?: string
}

export function ImpersonationBanner({ className }: ImpersonationBannerProps) {
  const { isImpersonating, impersonatedUser, endImpersonation } = useImpersonation()

  if (!isImpersonating || !impersonatedUser) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-amber-500 via-orange-500 to-red-500',
        'px-4 py-2 shadow-lg',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="mx-auto flex items-center justify-between gap-4 max-w-7xl">
        <div className="flex items-center gap-3 text-white">
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
            <Eye className="h-4 w-4" />
            <span className="font-semibold text-sm">IMPERSONATING</span>
          </div>
          
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">
              Viewing as: <strong>{impersonatedUser.name}</strong> ({impersonatedUser.email})
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 bg-white/20 rounded px-2 py-0.5">
            <Building2 className="h-3.5 w-3.5" />
            <span className="text-sm">{impersonatedUser.tenantName}</span>
          </div>
          
          <span className="text-sm opacity-90">
            Role: {impersonatedUser.role}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={endImpersonation}
          className="text-white hover:bg-white/20 hover:text-white border border-white/30"
        >
          <X className="h-4 w-4 mr-1" />
          Exit Impersonation
        </Button>
      </div>
    </div>
  )
}

/**
 * Quick Impersonation Modal
 * For selecting a user to impersonate from Platform Admin
 */
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useNavigate } from 'react-router-dom'

interface ImpersonationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenants?: Array<{ id: string; name: string }>
  users?: Array<{ id: string; email: string; name: string; tenantId: string; role: string }>
}

export function ImpersonationModal({
  open,
  onOpenChange,
  tenants = [],
  users = []
}: ImpersonationModalProps) {
  const { startImpersonation } = useImpersonation()
  const navigate = useNavigate()
  
  const [selectedTenant, setSelectedTenant] = useState('')
  const [selectedUser, setSelectedUser] = useState('')
  const [confirmText, setConfirmText] = useState('')

  const filteredUsers = selectedTenant 
    ? users.filter(u => u.tenantId === selectedTenant)
    : users

  const selectedUserData = users.find(u => u.id === selectedUser)
  const selectedTenantData = tenants.find(t => t.id === selectedTenant)

  const canImpersonate = selectedUser && confirmText.toLowerCase() === 'impersonate'

  const handleImpersonate = () => {
    if (!selectedUserData || !selectedTenantData) return

    startImpersonation({
      id: selectedUserData.id,
      email: selectedUserData.email,
      name: selectedUserData.name,
      tenantId: selectedTenantData.id,
      tenantName: selectedTenantData.name,
      role: selectedUserData.role
    })

    onOpenChange(false)
    setSelectedTenant('')
    setSelectedUser('')
    setConfirmText('')
    
    // Navigate to the tenant's dashboard
    navigate('/dashboard')
  }

  const handleCancel = () => {
    onOpenChange(false)
    setSelectedTenant('')
    setSelectedUser('')
    setConfirmText('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-amber-500" />
            Impersonate User
          </DialogTitle>
          <DialogDescription>
            View the platform as another user. All actions will be logged for audit purposes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tenant">Select Tenant</Label>
            <Select value={selectedTenant} onValueChange={setSelectedTenant}>
              <SelectTrigger id="tenant">
                <SelectValue placeholder="Choose a tenant..." />
              </SelectTrigger>
              <SelectContent>
                {tenants.map(tenant => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user">Select User</Label>
            <Select 
              value={selectedUser} 
              onValueChange={setSelectedUser}
              disabled={!selectedTenant}
            >
              <SelectTrigger id="user">
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email}) - {user.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedUserData && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
              <p className="text-sm font-medium text-amber-800">
                You will view the platform as:
              </p>
              <p className="text-sm text-amber-700">
                <strong>{selectedUserData.name}</strong> ({selectedUserData.role})
              </p>
              <p className="text-xs text-amber-600">
                All actions will be logged for audit compliance.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirm">
              Type <span className="font-mono bg-muted px-1 rounded">impersonate</span> to confirm
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type 'impersonate' to confirm"
              disabled={!selectedUser}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleImpersonate}
            disabled={!canImpersonate}
            className="bg-amber-500 hover:bg-amber-600"
          >
            <Eye className="h-4 w-4 mr-2" />
            Start Impersonation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
