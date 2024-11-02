"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { MapPin, Users, Bus, AlertTriangle, Settings, Route, UserCircle, Menu } from "lucide-react"
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { renderToStaticMarkup } from "react-dom/server"
import markerIcon from "../app/images/location_icon-2x.png"
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "http://localhost:8000/location_icon.svg",
  iconUrl: "http://localhost:8000/location_icon.svg",
  shadowUrl: "http://localhost:8000/marker-shadow.png"
});

// Mock data (same as before)
const demandData = [
  { time: '06:00', passengers: 120 },
  { time: '09:00', passengers: 300 },
  { time: '12:00', passengers: 200 },
  { time: '15:00', passengers: 250 },
  { time: '18:00', passengers: 350 },
  { time: '21:00', passengers: 180 },
]

const busData = [
  { id: 1, number: '24', location: 'Nizami St', occupancy: 80, status: 'On Route', lat: 40.3754, lng: 49.8391 },
  { id: 2, number: '17', location: 'Fountain Square', occupancy: 30, status: 'Available', lat: 40.3725, lng: 49.8369 },
  { id: 3, number: '35', location: '28th May', occupancy: 90, status: 'Crowded', lat: 40.37986, lng: 49.8485 }, 
  { id: 4, number: '12', location: 'Heydar Aliyev Center', occupancy: 60, status: 'On Route', lat: 40.3944, lng: 49.8676 },
  { id: 4, number: '12', location: '20 January', occupancy: 75, status: 'On Route', lat: 40.4041, lng: 49.8078 },  
]

const heatmapData = [
  { lat: 40.3754, lng: 49.8391, intensity: 0.8 },
  { lat: 40.3725, lng: 49.8369, intensity: 0.5 },
  { lat: 40.37986, lng: 49.8485, intensity: 0.9 },
  { lat: 40.3944, lng: 49.8676, intensity: 0.6 },
  { lat: 40.4041, lng: 49.8078, intensity: 0.75 },
]

const routeData = [
  { id: 1, number: '24', startPoint: 'Central Station', endPoint: 'Airport', avgDemand: 'High' },
  { id: 2, number: '17', startPoint: 'University', endPoint: 'Shopping Mall', avgDemand: 'Medium' },
  { id: 3, number: '35', startPoint: 'Residential Area', endPoint: 'Business District', avgDemand: 'High' },
  { id: 4, number: '12', startPoint: 'Suburbs', endPoint: 'City Center', avgDemand: 'Low' },
]

const driverData = [
  { id: 1, name: 'John Doe', busNumber: '24', status: 'On Duty', rating: 4.8 },
  { id: 2, name: 'Jane Smith', busNumber: '17', status: 'Break', rating: 4.5 },
  { id: 3, name: 'Mike Johnson', busNumber: '35', status: 'On Duty', rating: 4.9 },
  { id: 4, name: 'Sarah Brown', busNumber: '12', status: 'Off Duty', rating: 4.7 },
]

const settingsData = {
  crowdingThreshold: 80,
  reassignmentRadius: 5,
  demandPredictionInterval: 30,
  dataRefreshRate: 10,
  minimumIdleTiemBeforeReassignment: 5,
  reassignmentConfirmationTimeout: 5,
  notificationMethod: 'app',
}

export function AdvancedOperationsDashboardComponent() {
  const [activeTab, setActiveTab] = useState("overview")
  const [map, setMap] = useState<L.Map | null>(null)
  const [settings, setSettings] = useState(settingsData)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
const icon = L.icon({
  iconUrl: 'leaf-green.png',
  shadowUrl: 'leaf-shadow.png',

  iconSize:     [38, 95], // size of the icon
  shadowSize:   [50, 64], // size of the shadow
  iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62],  // the same for the shadow
  popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

  const displayMap = useMemo(
    () => (
      <MapContainer 
        center={[40.3693, 49.8315]} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        whenCreated={setMap}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {heatmapData.map((point, index) => (
          <CircleMarker
            key={index}
            center={[point.lat, point.lng]}
            radius={20 * point.intensity}
            fillColor="red"
            fillOpacity={0.5}
            stroke={false}
            
          />
        ))}
        {busData.map((bus) => (
          <Marker key={bus.id} position={[bus.lat, bus.lng]}>
            <Popup>
              Bus {bus.number}<br />
              Status: {bus.status}<br />
              Occupancy: {bus.occupancy}%
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    ),
    []
  )

  useEffect(() => {
    if (map) {
      map.invalidateSize()
    }
  }, [map])

  const handleSettingsChange = (key: string, value: string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Active Buses</CardTitle>
                  <Bus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42</div>
                  <p className="text-xs text-muted-foreground">+2 from last hour</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Passengers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,274</div>
                  <p className="text-xs text-muted-foreground">+18% from last hour</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Demand Routes</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">Route 24, 35, 12</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available for Reassignment</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">Near high demand areas</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Demand Heatmap</CardTitle>
                <CardDescription>Live view of high-demand areas and crowded routes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] rounded-md overflow-hidden">
                  {displayMap}
                </div>
              </CardContent>
            </Card>
          </div>
        )
      case "demand":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Hourly Demand Trend</CardTitle>
                <CardDescription>Passenger count over the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={demandData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="passengers" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Demand Prediction</CardTitle>
                <CardDescription>Forecasted peak hours and recommended preemptive bus assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li>Predicted peak: 18:00 - 19:00 on Route 24</li>
                  <li>Recommended: Assign 2 additional buses to Route 24 at 17:30</li>
                  <li>Potential crowding: Route 35 between 08:30 - 09:30</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )
      case "fleet":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Live Fleet Status</CardTitle>
              <CardDescription>Real-time view of all buses, their current status, and occupancy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Bus Number</th>
                      <th className="text-left p-2">Location</th>
                      <th className="text-left p-2">Occupancy</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {busData.map((bus) => (
                      <tr key={bus.id} className="border-t">
                        <td className="p-2">{bus.number}</td>
                        <td className="p-2">{bus.location}</td>
                        <td className="p-2">{bus.occupancy}%</td>
                        <td className="p-2">{bus.status}</td>
                        <td className="p-2">
                          <Button variant="outline" size="sm">Reassign</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )
      case "routes":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Route Management</CardTitle>
              <CardDescription>Manage and optimize bus routes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Route Number</th>
                      <th className="text-left p-2">Start Point</th>
                      <th className="text-left p-2">End Point</th>
                      <th className="text-left p-2">Avg. Demand</th>
                      <th className="text-left p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routeData.map((route) => (
                      <tr key={route.id} className="border-t">
                        <td className="p-2">{route.number}</td>
                        <td className="p-2">{route.startPoint}</td>
                        <td className="p-2">{route.endPoint}</td>
                        <td className="p-2">{route.avgDemand}</td>
                        <td className="p-2">
                          <Button variant="outline" size="sm">Edit</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button className="mt-4">Add New Route</Button>
            </CardContent>
          </Card>
        )
      case "drivers":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Driver Management</CardTitle>
              <CardDescription>Manage driver assignments and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Driver Name</th>
                      <th className="text-left p-2">Bus Number</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Rating</th>
                      <th className="text-left p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driverData.map((driver) => (
                      <tr key={driver.id} className="border-t">
                        <td className="p-2">{driver.name}</td>
                        <td className="p-2">{driver.busNumber}</td>
                        <td className="p-2">{driver.status}</td>
                        <td className="p-2">{driver.rating}</td>
                        <td className="p-2">
                          <Button variant="outline" size="sm">Reassign</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button className="mt-4">Add  New Driver</Button>
            </CardContent>
          </Card>
        )
      case "settings":
        return (
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system parameters and thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="crowding-threshold">Crowding Threshold (%)</Label>
                  <Input 
                    type="number" 
                    id="crowding-threshold" 
                    value={settings.crowdingThreshold}
                    onChange={(e) => handleSettingsChange('crowdingThreshold', parseInt(e.target.value))}
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="reassignment-radius">Reassignment Radius (km)</Label>
                  <Input 
                    type="number" 
                    id="reassignment-radius" 
                    value={settings.reassignmentRadius}
                    onChange={(e) => handleSettingsChange('reassignmentRadius', parseInt(e.target.value))}
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="demand-prediction-interval">Demand Prediction Interval (minutes)</Label>
                  <Input 
                    type="number" 
                    id="demand-prediction-interval" 
                    value={settings.demandPredictionInterval}
                    onChange={(e) => handleSettingsChange('demandPredictionInterval', parseInt(e.target.value))}
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="data-refresh-rate">Data Refresh Rate (seconds)</Label>
                  <Input 
                    type="number" 
                    id="data-refresh-rate" 
                    value={settings.dataRefreshRate}
                    onChange={(e) => handleSettingsChange('dataRefreshRate', parseInt(e.target.value))}
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="data-refresh-rate">Minimum Idle Time Before Reassignment (minutes)</Label>
                  <Input 
                    type="number" 
                    id="data-refresh-rate" 
                    value={settings.minimumIdleTiemBeforeReassignment}
                    onChange={(e) => handleSettingsChange('minimumIdleTimeBeforeReassignment', parseInt(e.target.value))}
                  />
                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="data-refresh-rate">Reassignment Confirmation Timeout (seconds)</Label>
                  <Input 
                    type="number" 
                    id="data-refresh-rate" 
                    value={settings.reassignmentConfirmationTimeout}
                    onChange={(e) => handleSettingsChange('reassignmentConfirmationTimeout', parseInt(e.target.value))}
                  />
                </div>
                <Button type="submit">Save Settings</Button>
              </form>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-white p-4 ${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ease-in-out`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${sidebarOpen ? 'block' : 'hidden'}`}>Dashboard</h2>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
        <nav>
          <ul className="space-y-2">
            {[
              { name: "Overview", icon: <MapPin className="h-5 w-5" />, value: "overview" },
              { name: "Demand Analysis", icon: <Users className="h-5 w-5" />, value: "demand" },
              { name: "Fleet Management", icon: <Bus className="h-5 w-5" />, value: "fleet" },
              { name: "Route Management", icon: <Route className="h-5 w-5" />, value: "routes" },
              { name: "Driver Management", icon: <UserCircle className="h-5 w-5" />, value: "drivers" },
              { name: "Settings", icon: <Settings className="h-5 w-5" />, value: "settings" },
            ].map((item) => (
              <li key={item.value}>
                <Button
                  variant={activeTab === item.value ? "secondary" : "ghost"}
                  className={`w-full justify-start ${sidebarOpen ? '' : 'justify-center'}`}
                  onClick={() => setActiveTab(item.value)}
                >
                  {item.icon}
                  {sidebarOpen && <span className="ml-2">{item.name}</span>}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">Advanced Dynamic Bus Routing Operations Dashboard</h1>
        {renderContent()}
      </main>
    </div>
  )
}