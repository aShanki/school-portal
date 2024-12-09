'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function SettingsPage() {
  const [isEditing, setIsEditing] = useState(false)

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/admin/settings')
      return res.json()
    }
  })

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">System Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label>School Name</label>
            <Input value={settings?.schoolName || ''} readOnly={!isEditing} />
          </div>
          <Button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Save Changes' : 'Edit Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
