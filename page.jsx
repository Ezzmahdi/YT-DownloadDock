// "use client"

// import type React from "react"

// import { useState } from "react"
// import Image from "next/image"
// import {
//   ChevronDown,
//   Download,
//   Folder,
//   Home,
//   Library,
//   Menu,
//   Plus,
//   TrendingUpIcon as Trending,
//   VideoIcon,
// } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Separator } from "@/components/ui/separator"

// interface Video {
//   id: string
//   title: string
//   thumbnail: string
//   duration: string
//   category?: string
// }

// interface Category {
//   id: string
//   name: string
//   videoCount: number
// }

// export default function DownloadsPage() {
//   const [isOpen, setIsOpen] = useState(true)
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true)
//   const [showPlaylist, setShowPlaylist] = useState(false)

//   const [videos, setVideos] = useState<Video[]>([
//     {
//       id: "1",
//       title: "Introduction to Next.js - Complete Beginner's Tutorial",
//       thumbnail: "/placeholder.svg?height=180&width=320",
//       duration: "12:34",
//     },
//     {
//       id: "2",
//       title: "Building Modern UIs with React - Advanced Concepts Explained",
//       thumbnail: "/placeholder.svg?height=180&width=320",
//       duration: "28:15",
//       category: "tutorials",
//     },
//     {
//       id: "3",
//       title: "TypeScript Best Practices - Tips and Tricks",
//       thumbnail: "/placeholder.svg?height=180&width=320",
//       duration: "15:45",
//       category: "tutorials",
//     },
//     {
//       id: "4",
//       title: "Summer Vibes - Lofi Hip Hop Mix",
//       thumbnail: "/placeholder.svg?height=180&width=320",
//       duration: "1:02:30",
//       category: "music",
//     },
//   ])

//   const [categories, setCategories] = useState<Category[]>([
//     { id: "tutorials", name: "Tutorials", videoCount: 2 },
//     { id: "music", name: "Music", videoCount: 1 },
//   ])

//   const [newCategory, setNewCategory] = useState("")
//   const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

//   const handleDragStart = (e: React.DragEvent, videoId: string) => {
//     e.dataTransfer.setData("videoId", videoId)
//   }

//   const handleDrop = (e: React.DragEvent, categoryId: string) => {
//     e.preventDefault()
//     const videoId = e.dataTransfer.getData("videoId")
//     setVideos(
//       videos.map((video) => {
//         if (video.id === videoId) {
//           return { ...video, category: categoryId }
//         }
//         return video
//       }),
//     )
//   }

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault()
//   }

//   const addCategory = () => {
//     if (newCategory.trim()) {
//       setCategories([...categories, { id: newCategory.toLowerCase(), name: newCategory, videoCount: 0 }])
//       setNewCategory("")
//     }
//   }

//   const filteredVideos = selectedCategory
//     ? videos.filter((video) => video.category === selectedCategory)
//     : videos.filter((video) => !video.category)

//   return (
//     <div className="grid h-screen grid-cols-[auto_1fr]">
//       <aside className={`border-r bg-background transition-all duration-300 ${isSidebarOpen ? "w-60" : "w-[72px]"}`}>
//         <div className="flex h-14 items-center border-b px-4">
//           <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
//             <Menu className="h-5 w-5" />
//           </Button>
//         </div>
//         <ScrollArea className="h-[calc(100vh-56px)]">
//           <div className="space-y-1 p-2">
//             <Button variant="ghost" className="w-full justify-start" size="lg">
//               <Home className="mr-4 h-5 w-5" />
//               {isSidebarOpen && "Home"}
//             </Button>
//             <Button variant="ghost" className="w-full justify-start" size="lg">
//               <Trending className="mr-4 h-5 w-5" />
//               {isSidebarOpen && "Trending"}
//             </Button>
//             <Button variant="ghost" className="w-full justify-start" size="lg">
//               <Library className="mr-4 h-5 w-5" />
//               {isSidebarOpen && "Library"}
//             </Button>
//             <Separator className="my-2" />
//             <Collapsible open={isOpen} onOpenChange={setIsOpen}>
//               <CollapsibleTrigger asChild>
//                 <Button variant="ghost" className="w-full justify-start" size="lg">
//                   <Download className="mr-4 h-5 w-5" />
//                   {isSidebarOpen && (
//                     <>
//                       Downloads
//                       <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
//                     </>
//                   )}
//                 </Button>
//               </CollapsibleTrigger>
//               <CollapsibleContent className="space-y-1">
//                 {isSidebarOpen &&
//                   categories.map((category) => (
//                     <Button
//                       key={category.id}
//                       variant={selectedCategory === category.id ? "secondary" : "ghost"}
//                       className="ml-4 w-[calc(100%-16px)] justify-start pl-8"
//                       onClick={() => {
//                         setSelectedCategory(category.id)
//                         setShowPlaylist(true)
//                       }}
//                       onDragOver={handleDragOver}
//                       onDrop={(e) => handleDrop(e, category.id)}
//                     >
//                       <Folder className="mr-2 h-4 w-4" />
//                       {category.name}
//                       <span className="ml-auto text-sm text-muted-foreground">{category.videoCount}</span>
//                     </Button>
//                   ))}
//                 {isSidebarOpen && (
//                   <Dialog>
//                     <DialogTrigger asChild>
//                       <Button variant="ghost" className="ml-4 w-[calc(100%-16px)] justify-start pl-8">
//                         <Plus className="mr-2 h-4 w-4" />
//                         New Category
//                       </Button>
//                     </DialogTrigger>
//                     <DialogContent>
//                       <DialogHeader>
//                         <DialogTitle>Create New Category</DialogTitle>
//                       </DialogHeader>
//                       <div className="flex gap-2">
//                         <Input
//                           placeholder="Category name"
//                           value={newCategory}
//                           onChange={(e) => setNewCategory(e.target.value)}
//                         />
//                         <Button onClick={addCategory}>Create</Button>
//                       </div>
//                     </DialogContent>
//                   </Dialog>
//                 )}
//               </CollapsibleContent>
//             </Collapsible>
//           </div>
//         </ScrollArea>
//       </aside>
//       <main className="overflow-auto">
//         {showPlaylist ? (
//           <div className="p-6">
//             <div className="mb-6 flex items-center gap-4">
//               <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-muted">
//                 <VideoIcon className="h-12 w-12 text-muted-foreground" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-semibold">
//                   {selectedCategory ? categories.find((c) => c.id === selectedCategory)?.name : "All Downloads"}
//                 </h1>
//                 <p className="text-muted-foreground">
//                   {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""}
//                 </p>
//               </div>
//             </div>
//             <div className="space-y-3">
//               {filteredVideos.map((video) => (
//                 <div
//                   key={video.id}
//                   className="group flex gap-4 rounded-lg p-2 hover:bg-muted"
//                   draggable
//                   onDragStart={(e) => handleDragStart(e, video.id)}
//                 >
//                   <div className="relative aspect-video w-40">
//                     <Image
//                       src={video.thumbnail || "/placeholder.svg"}
//                       alt={video.title}
//                       fill
//                       className="rounded-lg object-cover"
//                     />
//                     <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-xs text-white">
//                       {video.duration}
//                     </div>
//                   </div>
//                   <div className="flex-1">
//                     <h3 className="font-medium leading-tight">{video.title}</h3>
//                     {video.category && (
//                       <p className="mt-1 text-sm text-muted-foreground">
//                         {categories.find((c) => c.id === video.category)?.name}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ) : (
//           <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//             {videos.map((video) => (
//               <div
//                 key={video.id}
//                 className="group relative space-y-2"
//                 draggable
//                 onDragStart={(e) => handleDragStart(e, video.id)}
//               >
//                 <div className="relative aspect-video overflow-hidden rounded-xl">
//                   <Image
//                     src={video.thumbnail || "/placeholder.svg"}
//                     alt={video.title}
//                     fill
//                     className="object-cover transition-transform group-hover:scale-105"
//                   />
//                   <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-xs text-white">
//                     {video.duration}
//                   </div>
//                 </div>
//                 <div>
//                   <h3 className="font-medium leading-tight">{video.title}</h3>
//                   {video.category && (
//                     <p className="text-sm text-muted-foreground">
//                       {categories.find((c) => c.id === video.category)?.name}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </main>
//     </div>
//   )
// }