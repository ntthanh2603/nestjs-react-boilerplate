import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAddOwner } from "@/hooks/members/use-add-owner";
import { OwnerFormFields } from "@/components/admin/add-owner/owner-form-fields";

export default function AddOwnerPage() {
  const { form, onSubmit, isSubmitting } = useAddOwner();

  return (
    <div className="container mx-auto p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <OwnerFormFields control={form.control} />

          {/* Bottom row with Submit button */}
          <div className="flex flex-col items-center space-y-2 pt-4">
            <Button
              type="submit"
              className="w-full md:w-1/3"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
