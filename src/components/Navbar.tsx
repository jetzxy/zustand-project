import { useTaskStore } from "../store/useTaskStore"
import { PlusCircle, CheckSquare, Sparkles } from 'lucide-react';

export default function Navbar() {

    const openCreateModal = useTaskStore((state) => state.openCreateModal);



    return (
        <div>Navbar</div>
    )
}
