import JobForm from '@/components/forms/JobForm';

export default function NewJob() {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Job</h1>
      <JobForm />
    </div>
  );
}
