import Swal from "sweetalert2";

export function toast(icon, title) {
  return Swal.fire({
    toast: true,
    position: "top-end",
    icon,
    title,
    showConfirmButton: false,
    timer: 3200,
    timerProgressBar: true,
  });
}

export async function confirmDelete(name) {
  const r = await Swal.fire({
    title: "Delete this event?",
    text: `"${name}" and everyone's sign-ups for it will be removed.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete event",
    cancelButtonText: "Keep event",
    confirmButtonColor: "#b91c1c",
  });
  return r.isConfirmed;
}
