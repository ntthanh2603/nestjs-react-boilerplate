import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAddAdmin } from "@/hooks/members/use-add-admin";
import { AddAdminFormFields } from "@/components/admin/add-admin/add-admin-form-fields";

export default function AddAdminPage() {
  const { form, onSubmit, isSubmitting } = useAddAdmin();

  return (
    <div className="container mx-auto pl-4 pr-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <AddAdminFormFields control={form.control} />

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
