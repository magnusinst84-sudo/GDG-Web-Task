"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { mailingTemplate } from "@/constants";

import OrderedList from "@tiptap/extension-ordered-list";
import BulletList from "@tiptap/extension-bullet-list";
import Blockquote from "@tiptap/extension-blockquote";
import Document from "@tiptap/extension-document";
import Heading from "@tiptap/extension-heading";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { useState } from "react";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { CiWarning } from "react-icons/ci";
import { Input } from "./ui/input";

export default function MailComposer({ recipients, handleRowSelection }) {
    const [payloadData, setPayloadData] = useState({
        subject: "",
        body: "",
        mailType: "",
    });

    const [confirm, setConfirm] = useState(false);

    const templateTypes = ["Blank", "Interview Invite"];

    const editor = useEditor({
        extensions: [
            StarterKit,
            Document,
            Paragraph,
            Text,
            Heading.configure({
                levels: [1], // All heading levels
                HTMLAttributes: {
                    class: `text-4xl font-bold`,
                },
            }),
            Blockquote.configure({
                HTMLAttributes: {
                    class: "border-l-2 border-gray-800 pl-4 opacity-[80%]",
                },
            }),
            BulletList.configure({
                HTMLAttributes: {
                    class: "list-disc ml-5",
                },
            }),
            OrderedList.configure({
                HTMLAttributes: {
                    class: "list-decimal ml-5",
                },
            }),
        ],
        content: "",
        onUpdate: ({ editor: currentEditor }) => {
            setPayloadData((prev) => ({ ...prev, body: currentEditor.getHTML() }));
        },
        editorProps: {
            attributes: {
                class: "min-h-[150px] cursor-text rounded-md border border-zinc-700 bg-zinc-950 text-white p-5 ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ",
            },
        },
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="btn-editorial" disabled={!recipients}>
                    Send Email ({recipients})
                </Button>
            </DialogTrigger>
            <DialogContent
                className="max-w-2xl w-[92vw] bg-[#0a0a0a] border-zinc-800 text-white p-6 overflow-x-hidden space-y-4"
            >
                <DialogHeader className="border-b border-zinc-800/80 pb-3">
                    <DialogTitle className="font-serif text-xl tracking-tight text-white">Send Custom Mail</DialogTitle>
                    <DialogDescription className="mono-label text-zinc-400">
                        Send customized mails to {recipients} selected recipient{recipients === 1 ? "" : "s"}.
                    </DialogDescription>
                </DialogHeader>
                {recipients > 0 ? (
                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex flex-col gap-3 w-full">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                                {/* Subject */}
                                <Input
                                    className="w-full bg-zinc-950 border-zinc-800 text-xs font-mono focus:border-zinc-500 rounded-none text-zinc-100 placeholder:text-zinc-500"
                                    placeholder="Subject"
                                    onChange={(e) =>
                                        setPayloadData((prev) => ({
                                            ...prev,
                                            subject: e.target.value,
                                        }))
                                    }
                                />
                                {/* Select Template */}
                                <Select
                                    onValueChange={(value) => {
                                        switch (value) {
                                            case "Blank":
                                                editor.commands.setContent("");
                                                break;
                                            case "Interview Invite":
                                                setPayloadData((prev) => ({
                                                    ...prev,
                                                    mailType: value,
                                                }));
                                                editor.commands.setContent(
                                                    mailingTemplate.Interview
                                                );
                                                break;
                                            default:
                                                editor.commands.setContent("");
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-full bg-zinc-950 border-zinc-800 text-xs font-mono rounded-none text-zinc-100">
                                        <SelectValue placeholder="Select Template" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                        {templateTypes.map((tmp_type) => (
                                            <SelectItem key={tmp_type} value={tmp_type} className="text-xs font-mono focus:bg-zinc-800 focus:text-white">
                                                {tmp_type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Rich text formatting toolbar */}
                            <div className="flex flex-wrap gap-1 p-1.5 bg-zinc-950 border border-zinc-800 w-full max-h-36 overflow-y-auto">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        editor
                                            .chain()
                                            .focus()
                                            .toggleBold()
                                            .run()
                                    }
                                    disabled={
                                        !editor
                                            .can()
                                            .chain()
                                            .focus()
                                            .toggleBold()
                                            .run()
                                    }
                                    className={`px-2 py-1 h-auto text-[11px] font-mono border rounded-none ${
                                        editor.isActive("bold")
                                            ? "bg-zinc-800 border-zinc-600 text-white"
                                            : "border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    Bold
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        editor
                                            .chain()
                                            .focus()
                                            .toggleItalic()
                                            .run()
                                    }
                                    disabled={
                                        !editor
                                            .can()
                                            .chain()
                                            .focus()
                                            .toggleItalic()
                                            .run()
                                    }
                                    className={`px-2 py-1 h-auto text-[11px] font-mono border rounded-none ${
                                        editor.isActive("italic")
                                            ? "bg-zinc-800 border-zinc-600 text-white"
                                            : "border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    Italic
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        editor
                                            .chain()
                                            .focus()
                                            .toggleStrike()
                                            .run()
                                    }
                                    disabled={
                                        !editor
                                            .can()
                                            .chain()
                                            .focus()
                                            .toggleStrike()
                                            .run()
                                    }
                                    className={`px-2 py-1 h-auto text-[11px] font-mono border rounded-none ${
                                        editor.isActive("strike")
                                            ? "bg-zinc-800 border-zinc-600 text-white"
                                            : "border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    Strike
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        editor
                                            .chain()
                                            .focus()
                                            .toggleCode()
                                            .run()
                                    }
                                    disabled={
                                        !editor
                                            .can()
                                            .chain()
                                            .focus()
                                            .toggleCode()
                                            .run()
                                    }
                                    className={`px-2 py-1 h-auto text-[11px] font-mono border rounded-none ${
                                        editor.isActive("code")
                                            ? "bg-zinc-800 border-zinc-600 text-white"
                                            : "border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    Code
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        editor
                                            .chain()
                                            .focus()
                                            .unsetAllMarks()
                                            .run()
                                    }
                                    className="px-2 py-1 h-auto text-[11px] font-mono border border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:text-white rounded-none"
                                >
                                    Clear marks
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        editor
                                            .chain()
                                            .focus()
                                            .clearNodes()
                                            .run()
                                    }
                                    className="px-2 py-1 h-auto text-[11px] font-mono border border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:text-white rounded-none"
                                >
                                    Clear nodes
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        editor
                                            .chain()
                                            .focus()
                                            .setParagraph()
                                            .run()
                                    }
                                    className={`px-2 py-1 h-auto text-[11px] font-mono border rounded-none ${
                                        editor.isActive("paragraph")
                                            ? "bg-zinc-800 border-zinc-600 text-white"
                                            : "border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    Paragraph
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        editor
                                            .chain()
                                            .focus()
                                            .toggleHeading({ level: 1 })
                                            .run()
                                    }
                                    className={`px-2 py-1 h-auto text-[11px] font-mono border rounded-none ${
                                        editor.isActive("heading", { level: 1 })
                                            ? "bg-zinc-800 border-zinc-600 text-white"
                                            : "border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    Heading
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        editor
                                            .chain()
                                            .focus()
                                            .toggleBulletList()
                                            .run()
                                    }
                                    className={`px-2 py-1 h-auto text-[11px] font-mono border rounded-none ${
                                        editor.isActive("bulletList")
                                            ? "bg-zinc-800 border-zinc-600 text-white"
                                            : "border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    Bullet list
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        editor
                                            .chain()
                                            .focus()
                                            .toggleOrderedList()
                                            .run()
                                    }
                                    className={`px-2 py-1 h-auto text-[11px] font-mono border rounded-none ${
                                        editor.isActive("orderedList")
                                            ? "bg-zinc-800 border-zinc-600 text-white"
                                            : "border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    Ordered list
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        editor
                                            .chain()
                                            .focus()
                                            .toggleCodeBlock()
                                            .run()
                                    }
                                    className={`px-2 py-1 h-auto text-[11px] font-mono border rounded-none ${
                                        editor.isActive("codeBlock")
                                            ? "bg-zinc-800 border-zinc-600 text-white"
                                            : "border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    Code block
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        editor
                                            .chain()
                                            .focus()
                                            .toggleBlockquote()
                                            .run()
                                    }
                                    className={`px-2 py-1 h-auto text-[11px] font-mono border rounded-none ${
                                        editor.isActive("blockquote")
                                            ? "bg-zinc-800 border-zinc-600 text-white"
                                            : "border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:text-white"
                                    }`}
                                >
                                    Blockquote
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        editor
                                            .chain()
                                            .focus()
                                            .setHorizontalRule()
                                            .run()
                                    }
                                    className="px-2 py-1 h-auto text-[11px] font-mono border border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:text-white rounded-none"
                                >
                                    Horizontal rule
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        editor
                                            .chain()
                                            .focus()
                                            .setHardBreak()
                                            .run()
                                    }
                                    className="px-2 py-1 h-auto text-[11px] font-mono border border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:text-white rounded-none"
                                >
                                    Hard break
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        editor.chain().focus().undo().run()
                                    }
                                    disabled={
                                        !editor
                                            .can()
                                            .chain()
                                            .focus()
                                            .undo()
                                            .run()
                                    }
                                    className="px-2 py-1 h-auto text-[11px] font-mono border border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:text-white rounded-none"
                                >
                                    Undo
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        editor.chain().focus().redo().run()
                                    }
                                    disabled={
                                        !editor
                                            .can()
                                            .chain()
                                            .focus()
                                            .redo()
                                            .run()
                                    }
                                    className="px-2 py-1 h-auto text-[11px] font-mono border border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:text-white rounded-none"
                                >
                                    Redo
                                </Button>
                            </div>
                            <div className="w-full max-h-[260px] overflow-y-auto">
                                <EditorContent editor={editor} />
                            </div>
                        </div>
                        <DialogFooter className="flex flex-row justify-end items-center gap-3 pt-3 border-t border-zinc-800/80 w-full">
                            {!confirm ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setConfirm(true)}
                                    className="btn-editorial text-xs"
                                >
                                    Verify Mail
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled
                                    className="btn-editorial text-xs opacity-60 cursor-not-allowed text-emerald-400 border-emerald-500/40"
                                >
                                    ✓ Verified
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={!confirm}
                                onClick={() => {
                                    if (confirm) {
                                        handleRowSelection(payloadData);
                                        setConfirm(false);
                                    }
                                }}
                                className={`btn-editorial text-xs ${
                                    !confirm
                                        ? "opacity-40 cursor-not-allowed"
                                        : "border-white text-white hover:bg-white hover:text-black"
                                }`}
                            >
                                Send Mail
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="py-6 text-center">
                        <p className="inline-flex gap-2 items-center justify-center font-mono text-xs text-red-400 border border-red-500/20 bg-red-950/20 px-4 py-2">
                            <CiWarning size={14} /> No recipients selected
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
