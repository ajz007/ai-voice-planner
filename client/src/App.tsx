import { Switch, Route } from "wouter";
import { Button } from "@/components/ui/button";
import { Mic, ListTodo } from "lucide-react";
import { Link } from "wouter";
import { Notes } from "./pages/Notes";
import { Tasks } from "./pages/Tasks";

function App() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r bg-background">
        <div className="border-b px-6 py-3">
          <h2 className="text-lg font-semibold">AI Voice Planner</h2>
        </div>
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start">
                <Mic className="mr-2 h-4 w-4" />
                Notes
              </Button>
            </Link>
            <Link href="/tasks">
              <Button variant="ghost" className="w-full justify-start">
                <ListTodo className="mr-2 h-4 w-4" />
                Tasks
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container py-6">
          <Switch>
            <Route path="/" component={Notes} />
            <Route path="/tasks" component={Tasks} />
            <Route>404 Page Not Found</Route>
          </Switch>
        </div>
      </main>
    </div>
  );
}

export default App;