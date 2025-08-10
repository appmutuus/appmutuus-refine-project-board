import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import supabase from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export const jobSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20),
  mode: z.enum(['goodDeeds', 'paid']),
  price: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().positive().optional()),
  category: z.string().min(1),
  latitude: z.preprocess((val) => Number(val), z.number()),
  longitude: z.preprocess((val) => Number(val), z.number()),
  timeLimit: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().int().positive().optional()),
  deadline: z.preprocess((val) => (val ? new Date(val) : undefined), z.date().optional()),
}).superRefine((data, ctx) => {
  if (data.mode === 'paid' && typeof data.price !== 'number') {
    ctx.addIssue({ code: 'custom', path: ['price'], message: 'Price required for paid jobs' });
  }
  if (!data.timeLimit && !data.deadline) {
    ctx.addIssue({ code: 'custom', path: ['timeLimit'], message: 'Provide time limit or deadline' });
  }
});

export type JobFormValues = z.infer<typeof jobSchema>;

export function JobForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<JobFormValues>({ resolver: zodResolver(jobSchema), defaultValues: { mode: 'goodDeeds' } });

  const mode = watch('mode');

  const onSubmit = async (values: JobFormValues) => {
    setLoading(true);
    const deadline = values.deadline ?? new Date(Date.now() + (values.timeLimit || 0) * 60000);
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        title: values.title,
        description: values.description,
        mode: values.mode,
        price: values.mode === 'paid' ? values.price : null,
        category: values.category,
        location: `POINT(${values.longitude} ${values.latitude})`,
        deadline: deadline.toISOString(),
        status: 'open',
      })
      .select()
      .single();

    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Job created');
      navigate(`/jobs/${data.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register('title')} />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register('description')} />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>
      <div>
        <Label htmlFor="mode">Mode</Label>
        <select id="mode" className="border p-2 w-full" {...register('mode')} defaultValue={mode}>
          <option value="goodDeeds">Good Deeds</option>
          <option value="paid">Paid</option>
        </select>
      </div>
      {mode === 'paid' && (
        <div>
          <Label htmlFor="price">Price</Label>
          <Input id="price" type="number" step="0.01" {...register('price')} />
          {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
        </div>
      )}
      <div>
        <Label htmlFor="category">Category</Label>
        <Input id="category" {...register('category')} />
        {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
      </div>
      <div className="flex space-x-2">
        <div className="flex-1">
          <Label htmlFor="latitude">Latitude</Label>
          <Input id="latitude" type="number" step="any" {...register('latitude')} />
          {errors.latitude && <p className="text-sm text-red-500">{errors.latitude.message}</p>}
        </div>
        <div className="flex-1">
          <Label htmlFor="longitude">Longitude</Label>
          <Input id="longitude" type="number" step="any" {...register('longitude')} />
          {errors.longitude && <p className="text-sm text-red-500">{errors.longitude.message}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
        <Input id="timeLimit" type="number" {...register('timeLimit')} />
        {errors.timeLimit && <p className="text-sm text-red-500">{errors.timeLimit.message}</p>}
      </div>
      <div>
        <Label htmlFor="deadline">Deadline</Label>
        <Input id="deadline" type="datetime-local" {...register('deadline')} />
        {errors.deadline && <p className="text-sm text-red-500">{errors.deadline.message}</p>}
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Create Job'}
      </Button>
    </form>
  );
}

export default JobForm;
