'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bus, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  Plus,
  X,
  Eye,
  Loader2
} from 'lucide-react';

type BusStatus = 'waiting_home' | 'on_bus_to_school' | 'at_school' | 'on_bus_to_home' | 'home';

interface BusStudent {
  id: string;
  name: string;
  grade: string;
  route: string;
  status: BusStatus;
  pickupTime?: string;
  dropoffTime?: string;
  eta?: string;
}

interface BusRoute {
  id: string;
  name: string;
  code: string;
  studentCount: number;
  status: 'morning' | 'evening' | 'completed';
}

const getStatusInfo = (status: BusStatus) => {
  const statusMap: Record<BusStatus, { label: string; color: string; bg: string; icon: any }> = {
    waiting_home: { label: 'Waiting at Home', color: 'text-amber-600', bg: 'bg-amber-100', icon: Clock },
    on_bus_to_school: { label: 'On Bus to School', color: 'text-blue-600', bg: 'bg-blue-100', icon: Bus },
    at_school: { label: 'At School', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle2 },
    on_bus_to_home: { label: 'On Bus Home', color: 'text-purple-600', bg: 'bg-purple-100', icon: Bus },
    home: { label: 'Home Safe', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: CheckCircle2 },
  };
  return statusMap[status];
};

export default function BusTrackingPage() {
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [students, setStudents] = useState<BusStudent[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bus');
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);
        setRoutes(data.routes || []);
      }
    } catch (error) {
      console.error('Failed to fetch bus data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const morningStudents = students.filter(s => s.status === 'waiting_home' || s.status === 'on_bus_to_school');
  const atSchool = students.filter(s => s.status === 'at_school');
  const returningHome = students.filter(s => s.status === 'on_bus_to_home' || s.status === 'home');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">School Bus Tracking</h1>
          <p className="text-zinc-500 mt-1 text-sm sm:text-base">Monitor students using school transportation</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus size={18} />
          Add Bus Route
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock size={20} className="text-amber-600" />
            </div>
            <span className="text-xs sm:text-sm text-zinc-500">Morning Pickup</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-zinc-900">{morningStudents.length}</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <span className="text-xs sm:text-sm text-zinc-500">At School</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-zinc-900">{atSchool.length}</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Bus size={20} className="text-purple-600" />
            </div>
            <span className="text-xs sm:text-sm text-zinc-500">Returning Home</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-zinc-900">{returningHome.length}</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users size={20} className="text-blue-600" />
            </div>
            <span className="text-xs sm:text-sm text-zinc-500">Total Bus Students</span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-zinc-900">{students.length}</p>
        </div>
      </div>

      {/* Bus Routes */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-zinc-200">
          <h2 className="text-lg font-bold text-zinc-900">Active Bus Routes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Route</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Students</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {routes.map((route) => (
                <tr key={route.id} className="hover:bg-zinc-50">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Bus size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">{route.name}</p>
                        <p className="text-xs text-zinc-500 font-mono">{route.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className="text-sm font-medium text-zinc-900">{route.studentCount} students</span>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      route.status === 'morning' ? 'bg-amber-100 text-amber-700' :
                      route.status === 'evening' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {route.status === 'morning' ? 'Morning Trip' : route.status === 'evening' ? 'Evening Trip' : 'Completed'}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <button 
                      onClick={() => setSelectedRoute(route)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      <Eye size={16} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Tracking */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm">
        <div className="p-4 sm:p-6 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <h2 className="text-lg font-bold text-zinc-900">Live Student Tracking</h2>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-4 max-h-[500px] overflow-y-auto">
          {students.map((student) => {
            const statusInfo = getStatusInfo(student.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={student.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${statusInfo.bg}`}>
                    <StatusIcon size={20} className={statusInfo.color} />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900">{student.name}</p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span>{student.grade}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {student.route}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  {student.eta && (
                    <p className="text-xs text-zinc-500 mt-1">
                      ETA: {student.eta}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Route Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-zinc-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900">Add Bus Route</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={24} />
              </button>
            </div>
            <form className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Route Name</label>
                <input 
                  type="text" 
                  placeholder="Route A - Ikeja"
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Route Code</label>
                <input 
                  type="text" 
                  placeholder="RTA-001"
                  className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-900 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">Start Time</label>
                  <input 
                    type="time" 
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1.5">End Time</label>
                  <input 
                    type="time" 
                    className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 ring-zinc-900"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-zinc-100 text-zinc-600 font-bold rounded-xl hover:bg-zinc-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                >
                  Create Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
