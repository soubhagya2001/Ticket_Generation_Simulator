import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Ticket, User, Train as TrainIcon, Calendar, MapPin, CreditCard, Receipt, Plus, Trash2 } from 'lucide-react';
import moment from 'moment';
import axios from 'axios';
import { 
  TRAIN_CLASSES, 
  QUOTAS, 
  BOOKING_STATUSES, 
  GENDERS, 
  CONVENIENCE_FEE 
} from '../utils/constants';

const TicketGeneration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const trainData = location.state?.train || {};
  const searchDate = location.state?.searchDate || '';

  useEffect(() => {
    console.log(location.state?.train); 
    // If no train data (e.g. direct access), redirect back to home
    if (!location.state?.train) {
      navigate('/');
    }
  }, [location.state, navigate]);

  const generatePNR = () => Math.floor(1000000000 + Math.random() * 9000000000).toString();
  const generateInvoice = () => 'PS' + Array.from({length: 14}, () => Math.floor(Math.random() * 10)).join('');

  // Filter available classes for this train
  const availableClasses = TRAIN_CLASSES.filter(c => 
    trainData.classes?.includes(c.value)
  );

  // Filter available quotas for this train
  const availableQuotas = trainData.quotas?.length > 0
    ? QUOTAS.filter(q => trainData.quotas.includes(q.value))
    : QUOTAS;

  const PASSENGER_TYPES = [
    { label: 'Adult', value: 'adult' },
    { label: 'Child', value: 'child' },
    { label: 'Senior Male', value: 'senior_male' },
    { label: 'Senior Female', value: 'senior_female' },
    { label: 'Divyang', value: 'divyang' },
    { label: 'Escort', value: 'escort' },
  ];

  const getPassengerFare = (cls, qta, type) => {
    const qKey = qta === 'TQ' ? 'tatkal' : 'normal';
    const fare = trainData.fares?.[cls]?.[qKey]?.[type];
    return fare !== null && fare !== undefined ? fare : 0;
  };

  const calculateTotalTicketFare = (passengers, cls, qta) => {
    return passengers.reduce((sum, p) => sum + getPassengerFare(cls, qta, p.passengerType || 'adult'), 0);
  };

  const [formData, setFormData] = useState({
    pnr: generatePNR(),
    invoiceNo: generateInvoice(),
    trainNo: trainData.train_no || '',
    trainName: trainData.train_name || '',
    fromStation: trainData.from_stn_name || '',
    fromStationCode: trainData.from_stn_code || '',
    toStation: trainData.to_stn_name || '',
    toStationCode: trainData.to_stn_code || '',
    departureDate: searchDate ? moment(searchDate, 'DD-MM-YYYY').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
    departureTime: trainData.from_time || '',
    arrivalDate: searchDate ? moment(searchDate, 'DD-MM-YYYY').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD'),
    arrivalTime: trainData.to_time || '',
    distance: '',
    trainClass: trainData.classes?.[0] || 'SL',
    quota: trainData.quotas?.[0] || 'GN',
    bookingDate: moment().format('YYYY-MM-DDTHH:mm'),
    passengers: [
      { 
        name: '', 
        age: '', 
        gender: 'Male', 
        passengerType: 'adult',
        bookingStatus: 'CNF', 
        coach: trainData.coach_composition?.[trainData.classes?.[0] || 'SL']?.[0] || 'S1', 
        seat: '12', 
        currentStatus: 'CNF' 
      }
    ],
    ticketFare: '0.00',
    taxableValue: '0.00',
    convenienceFee: CONVENIENCE_FEE.toFixed(2),
  });

  const [totalFare, setTotalFare] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  // Calculate initial ticket fare
  useEffect(() => {
    const initialFare = calculateTotalTicketFare(formData.passengers, formData.trainClass, formData.quota);
    setFormData(prev => ({
      ...prev,
      ticketFare: initialFare.toFixed(2),
      taxableValue: initialFare.toFixed(2)
    }));
  }, []);

  useEffect(() => {
    const fare = parseFloat(formData.ticketFare) || 0;
    const fee = parseFloat(formData.convenienceFee) || 0;
    setTotalFare((fare + fee).toFixed(2));
  }, [formData.ticketFare, formData.convenienceFee]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'trainClass' || name === 'quota') {
      const newClass = name === 'trainClass' ? value : formData.trainClass;
      const newQuota = name === 'quota' ? value : formData.quota;
      
      const newFare = calculateTotalTicketFare(formData.passengers, newClass, newQuota);
      const defaultCoach = trainData.coach_composition?.[newClass]?.[0] || (newClass.startsWith('A') || newClass.startsWith('B') || newClass === '1A' || newClass === '2A' || newClass === '3A' ? 'B1' : 'S1');
      
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        ticketFare: newFare.toFixed(2),
        taxableValue: newFare.toFixed(2),
        passengers: prev.passengers.map(p => ({ ...p, coach: defaultCoach }))
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...formData.passengers];
    updatedPassengers[index][field] = value;
    
    // Sync current status with booking status if booking status is changed
    if (field === 'bookingStatus') {
      updatedPassengers[index]['currentStatus'] = value;
    }

    // Recalculate fare if passenger type changes
    if (field === 'passengerType') {
      const newFare = calculateTotalTicketFare(updatedPassengers, formData.trainClass, formData.quota);
      setFormData(prev => ({ 
        ...prev, 
        passengers: updatedPassengers,
        ticketFare: newFare.toFixed(2),
        taxableValue: newFare.toFixed(2)
      }));
    } else {
      setFormData(prev => ({ ...prev, passengers: updatedPassengers }));
    }
  };

  const addPassenger = () => {
    const defaultCoach = trainData.coach_composition?.[formData.trainClass]?.[0] || (formData.trainClass.startsWith('A') || formData.trainClass.startsWith('B') || formData.trainClass === '1A' || formData.trainClass === '2A' || formData.trainClass === '3A' ? 'B1' : 'S1');
    const newPassenger = { 
      name: '', 
      age: '', 
      gender: 'Male', 
      passengerType: 'adult',
      bookingStatus: 'CNF', 
      coach: defaultCoach, 
      seat: '', 
      currentStatus: 'CNF' 
    };
    
    const updatedPassengers = [...formData.passengers, newPassenger];
    const newFare = calculateTotalTicketFare(updatedPassengers, formData.trainClass, formData.quota);
    
    setFormData(prev => ({
      ...prev,
      passengers: updatedPassengers,
      ticketFare: newFare.toFixed(2),
      taxableValue: newFare.toFixed(2)
    }));
  };

  const removePassenger = (index) => {
    if (formData.passengers.length > 1) {
      const updatedPassengers = formData.passengers.filter((_, i) => i !== index);
      const newFare = calculateTotalTicketFare(updatedPassengers, formData.trainClass, formData.quota);
      setFormData(prev => ({ 
        ...prev, 
        passengers: updatedPassengers,
        ticketFare: newFare.toFixed(2),
        taxableValue: newFare.toFixed(2)
      }));
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      console.log('Generating Ticket:', formData);
      
      const response = await axios.post('http://localhost:3000/tickets/generate', formData, {
        responseType: 'blob', // Important for handling binary data
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Filename from PNR
      link.setAttribute('download', `Ticket_${formData.pnr}.docx`);
      
      // Append to body, click, and cleanup
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('Ticket generated and downloaded successfully!');
    } catch (error) {
      console.error('Error generating ticket:', error);
      alert('Failed to generate ticket. Please ensure the backend is running and correct template exists.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.trainNo &&
      formData.trainName &&
      formData.fromStationCode &&
      formData.toStationCode &&
      formData.distance &&
      formData.passengers.every(p => p.name && p.age && p.seat && p.coach)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-blue-600 text-white pt-8 pb-32">
        <div className="max-w-4xl mx-auto px-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-blue-100 hover:text-white transition-colors mb-6 group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold uppercase tracking-wide text-sm">Back to Search</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
              <Ticket className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Generate Ticket</h1>
              <p className="text-blue-100 font-medium">Create a digital ticket for your journey</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-24">
        <form onSubmit={handleGenerate} className="space-y-8">
          {/* Train & Journey Information */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center space-x-2">
              <TrainIcon className="h-5 w-5 text-blue-600" />
              <h2 className="font-bold text-gray-800 uppercase tracking-wide text-sm">Journey Information</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
              {/* Train & Number - Usually takes 2 cols on Desktop */}
              <div className="lg:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Train Name & Number</label>
                <div className="grid grid-cols-[100px_1fr] rounded-xl overflow-hidden border border-gray-200 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                  <input 
                    type="text" 
                    name="trainNo"
                    value={formData.trainNo}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border-r border-gray-200 px-4 py-3 font-bold text-blue-600 focus:outline-none"
                    placeholder="22137"
                  />
                  <input 
                    type="text" 
                    name="trainName"
                    value={formData.trainName}
                    onChange={handleInputChange}
                    className="w-full bg-white px-4 py-3 font-bold text-gray-800 focus:outline-none uppercase"
                    placeholder="PRERANA EXPRESS"
                  />
                </div>
              </div>

              {/* PNR - Distinct field */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">PNR Number</label>
                <input 
                  type="text" 
                  name="pnr"
                  value={formData.pnr}
                  onChange={handleInputChange}
                  className="w-full bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 font-black text-blue-700 tracking-[0.2em] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 outline-none transition-all shadow-inner"
                />
              </div>

              {/* From Station - Full width on mobile/tablet to avoid squishing */}
              <div className="md:col-span-2 lg:col-span-1 space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">From Station</label>
                <div className="grid grid-cols-[80px_1fr] rounded-xl overflow-hidden border border-gray-200 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                  <input 
                    type="text" 
                    name="fromStationCode"
                    value={formData.fromStationCode}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border-r border-gray-200 px-3 py-3 font-bold uppercase text-center focus:outline-none placeholder:text-gray-300"
                    placeholder="CODE"
                  />
                  <input 
                    type="text" 
                    name="fromStation"
                    value={formData.fromStation}
                    onChange={handleInputChange}
                    className="w-full bg-white px-4 py-3 font-medium text-gray-800 focus:outline-none"
                    placeholder="Station Name"
                  />
                </div>
              </div>

              {/* To Station */}
              <div className="md:col-span-2 lg:col-span-1 space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">To Station</label>
                <div className="grid grid-cols-[80px_1fr] rounded-xl overflow-hidden border border-gray-200 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                  <input 
                    type="text" 
                    name="toStationCode"
                    value={formData.toStationCode}
                    onChange={handleInputChange}
                    className="w-full bg-gray-50 border-r border-gray-200 px-3 py-3 font-bold uppercase text-center focus:outline-none placeholder:text-gray-300"
                    placeholder="CODE"
                  />
                  <input 
                    type="text" 
                    name="toStation"
                    value={formData.toStation}
                    onChange={handleInputChange}
                    className="w-full bg-white px-4 py-3 font-medium text-gray-800 focus:outline-none"
                    placeholder="Station Name"
                  />
                </div>
              </div>

              {/* Distance */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Distance (km)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    name="distance"
                    value={formData.distance}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
                    placeholder="e.g. 450"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">KM</span>
                </div>
              </div>

              {/* Dates & Times */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Departure</label>
                <div className="grid grid-cols-[1fr_100px] rounded-xl overflow-hidden border border-gray-200 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                  <input type="date" name="departureDate" value={formData.departureDate} onChange={handleInputChange} className="w-full px-3 py-3 text-sm focus:outline-none" />
                  <input type="text" name="departureTime" value={formData.departureTime} onChange={handleInputChange} className="w-full bg-gray-50 border-l border-gray-200 px-3 py-3 text-sm font-bold text-center focus:outline-none" placeholder="HH:MM" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Arrival</label>
                <div className="grid grid-cols-[1fr_100px] rounded-xl overflow-hidden border border-gray-200 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                  <input type="date" name="arrivalDate" value={formData.arrivalDate} onChange={handleInputChange} className="w-full px-3 py-3 text-sm focus:outline-none" />
                  <input type="text" name="arrivalTime" value={formData.arrivalTime} onChange={handleInputChange} className="w-full bg-gray-50 border-l border-gray-200 px-3 py-3 text-sm font-bold text-center focus:outline-none" placeholder="HH:MM" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Class & Quota</label>
                <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-gray-200 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                  <select name="trainClass" value={formData.trainClass} onChange={handleInputChange} className="w-full px-3 py-3 text-xs font-bold focus:outline-none cursor-pointer">
                    {availableClasses.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <select name="quota" value={formData.quota} onChange={handleInputChange} className="w-full bg-gray-50 border-l border-gray-200 px-3 py-3 text-xs font-bold focus:outline-none cursor-pointer">
                    {availableQuotas.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Details */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-emerald-600" />
                <h2 className="font-bold text-gray-800 uppercase tracking-wide text-sm">Passenger Details</h2>
              </div>
              <button 
                type="button" 
                onClick={addPassenger}
                className="flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-800 uppercase"
              >
                <Plus className="h-4 w-4" />
                <span>Add Passenger</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {formData.passengers.map((p, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative group/pass">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Name</label>
                      <input 
                        type="text" 
                        value={p.name} 
                        onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold"
                        placeholder="Full Name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Age</label>
                      <input 
                        type="number" 
                        value={p.age} 
                        onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold"
                        placeholder="Age"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Gender</label>
                      <select 
                        value={p.gender} 
                        onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold"
                      >
                        {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Type</label>
                      <select 
                        value={p.passengerType} 
                        onChange={(e) => handlePassengerChange(index, 'passengerType', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-600"
                      >
                        {PASSENGER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Booking Status</label>
                      <select 
                        value={p.bookingStatus} 
                        onChange={(e) => handlePassengerChange(index, 'bookingStatus', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm font-bold text-emerald-600"
                      >
                        {BOOKING_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Coach & Seat</label>
                      <div className="flex space-x-1">
                        <select 
                          value={p.coach} 
                          onChange={(e) => handlePassengerChange(index, 'coach', e.target.value)}
                          className="w-1/2 bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs font-bold uppercase"
                          required
                        >
                          {(trainData.coach_composition?.[formData.trainClass] || ['S1']).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <input type="text" value={p.seat} onChange={(e) => handlePassengerChange(index, 'seat', e.target.value)} className="w-1/2 bg-white border border-gray-200 rounded-lg px-2 py-2 text-xs font-bold uppercase" placeholder="Seat" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Current Status</label>
                      <input 
                        type="text" 
                        value={p.currentStatus} 
                        onChange={(e) => handlePassengerChange(index, 'currentStatus', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-emerald-600"
                        placeholder="CNF"
                      />
                    </div>
                  </div>
                  {formData.passengers.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removePassenger(index)}
                      className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full shadow-sm hover:bg-red-200 transition-colors opacity-0 group-hover/pass:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Invoice Information */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-orange-600" />
              <h2 className="font-bold text-gray-800 uppercase tracking-wide text-sm">Payment & Invoice</h2>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ticket Fare (₹)</label>
                <input 
                  type="text" 
                  name="ticketFare"
                  value={formData.ticketFare}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Convenience Fee (₹)</label>
                <input 
                  type="text" 
                  name="convenienceFee"
                  value={formData.convenienceFee}
                  readOnly
                  className="w-full bg-gray-100 border border-gray-100 rounded-lg px-3 py-2 font-bold text-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Fare (₹)</label>
                <div className="w-full bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 font-black text-emerald-700 text-lg flex items-center h-[42px]">
                  ₹ {totalFare}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Taxable Value (₹)</label>
                <input 
                  type="text" 
                  name="taxableValue"
                  value={formData.taxableValue}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Invoice Number</label>
                <input 
                  type="text" 
                  name="invoiceNo"
                  value={formData.invoiceNo}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Booking Date & Time</label>
                <input 
                  type="datetime-local" 
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex pt-4">
            <button 
              type="submit"
              disabled={!isFormValid()}
              className={`w-full font-black py-4 rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-3 uppercase tracking-[0.1em] ${
                isFormValid() 
                ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-blue-200 hover:scale-[1.02] active:scale-[0.98]" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
              }`}
            >
              <Receipt className={`h-6 w-6 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating...' : 'Generate E-Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketGeneration;
