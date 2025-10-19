import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { dbHelpers } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface Props {
  courseId: string;
  courseName: string;
}

export const ClassScheduler: React.FC<Props> = ({ courseId, courseName }) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(60);
  const [meetingLink, setMeetingLink] = useState('');
  const [platform, setPlatform] = useState<'zoom'|'meet'|'teams'|'custom'>('zoom');
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);

  useEffect(() => {
    if (!courseId) return;
    
    // Set up real-time listener for scheduled classes
    const unsubscribe = dbHelpers.listenToScheduledClasses(courseId, (classes) => {
      setUpcoming(classes);
    });
    
    return unsubscribe; // Cleanup listener on unmount
  }, [courseId]);

  const loadUpcomingClasses = async () => {
    const res = await dbHelpers.getUpcomingClasses(courseId);
    if (res.data) setUpcoming(res.data);
  };

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setMeetingLink('');
    setEditingClass(null);
  };

  const startEdit = (cls: any) => {
    setEditingClass(cls);
    setTitle(cls.title || '');
    setDescription(cls.description || '');
    setDuration(cls.duration || 60);
    setMeetingLink(cls.meetingUrl || '');
    setPlatform(cls.platform || 'zoom');
    
    // Format date and time from startTime
    const startTime = new Date(cls.startTime?.toDate ? cls.startTime.toDate() : cls.startTime);
    const dateStr = startTime.toISOString().split('T')[0];
    const timeStr = startTime.toTimeString().slice(0, 5);
    setDate(dateStr);
    setTime(timeStr);
  };

  const handleCreateOrUpdate = async () => {
    if (!user) return;
    if (!title || !date || !time) {
      error('Validation Error', 'Please fill title, date and time');
      return;
    }
    
    setLoading(true);
    try {
      const startTime = new Date(`${date}T${time}`);
      const endTime = new Date(startTime.getTime() + duration * 60000);
      
      if (editingClass) {
        // Update existing class
        const res = await dbHelpers.updateScheduledClass(editingClass.id, {
          title,
          description,
          startTime,
          endTime,
          duration,
          meetingUrl: meetingLink,
          platform
        });
        if (res.error) throw new Error(res.error);
        success('Class Updated', 'Scheduled class has been updated successfully');
      } else {
        // Create new class
        const res = await dbHelpers.createScheduledClass({
          title,
          description,
          courseId,
          instructorId: user.id,
          instructorName: user.displayName,
          startTime,
          endTime,
          duration,
          meetingUrl: meetingLink,
          platform,
          status: 'scheduled',
          enrolledStudents: []
        });
        if (res.error) throw new Error(res.error);
        success('Class Scheduled', 'New class has been scheduled successfully');
      }
      
      clearForm();
      await loadUpcomingClasses();
    } catch (err) {
      console.error(err);
      error('Operation Failed', editingClass ? 'Failed to update class' : 'Failed to schedule class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input placeholder="Class title" value={title} onChange={e => setTitle(e.target.value)} />
        <Select value={platform} onValueChange={(v:any) => setPlatform(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="zoom">Zoom</SelectItem>
            <SelectItem value="meet">Google Meet</SelectItem>
            <SelectItem value="teams">Microsoft Teams</SelectItem>
            <SelectItem value="custom">Custom Link</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Meeting link (optional)" value={meetingLink} onChange={e => setMeetingLink(e.target.value)} />
        <Input placeholder="Duration (minutes)" type="number" value={String(duration)} onChange={e => setDuration(Number(e.target.value))} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input placeholder="YYYY-MM-DD" value={date} onChange={e => setDate(e.target.value)} />
        <Input placeholder="HH:MM" value={time} onChange={e => setTime(e.target.value)} />
      </div>
      <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
      <div className="flex space-x-2">
        <Button onClick={handleCreateOrUpdate} disabled={loading}>
          {loading ? (editingClass ? 'Updating...' : 'Scheduling...') : (editingClass ? 'Update Class' : 'Schedule Class')}
        </Button>
        {editingClass && (
          <Button variant="outline" onClick={clearForm} disabled={loading}>
            Cancel Edit
          </Button>
        )}
      </div>

      <div>
        <h3 className="font-semibold">Upcoming Classes</h3>
        <div className="space-y-2 mt-2">
          {upcoming.map(c => (
            <div key={c.id} className="p-3 border rounded">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium">{c.title}</div>
                  {c.description ? <div className="text-sm text-gray-700">{c.description}</div> : null}
                  <div className="text-sm text-gray-600">
                    {new Date(c.startTime?.toDate ? c.startTime.toDate() : c.startTime).toLocaleString()}
                    {c.endTime ? ` — ${new Date(c.endTime?.toDate ? c.endTime.toDate() : c.endTime).toLocaleTimeString()}` : ''}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => startEdit(c)}
                  disabled={loading}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
