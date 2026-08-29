(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/admin/coupons/CouponForm.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CouponForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const initialForm = {
    storeId: "",
    type: "code",
    title: "",
    description: "",
    discount: "",
    code: "",
    couponUrl: "",
    terms: "",
    startsAt: "",
    expiresAt: "",
    isActive: true,
    isFeatured: false,
    homepageSection: "featured",
    image: "/images/placeholder.png",
    labelTop: "",
    labelBottom: ""
};
function CouponForm({ stores }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialForm);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [uploadingImage, setUploadingImage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [imageFile, setImageFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [imagePreview, setImagePreview] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const handleChange = (event)=>{
        const { name, value, type, checked } = event.target;
        setFormData((current)=>({
                ...current,
                [name]: type === "checkbox" ? checked : value
            }));
    };
    const handleFileChange = (e)=>{
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                setError("Please select a valid image file.");
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setError("");
        }
    };
    const handleSubmit = async (event_0)=>{
        event_0.preventDefault();
        setLoading(true);
        setError("");
        try {
            let imageUrl = formData.image;
            if (imageFile) {
                setUploadingImage(true);
                const imageFormData = new FormData();
                imageFormData.append("file", imageFile);
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: imageFormData
                });
                if (!uploadRes.ok) {
                    const errData = await uploadRes.json();
                    throw new Error(errData.message || "Failed to upload image");
                }
                const uploadData = await uploadRes.json();
                imageUrl = uploadData.url;
                setUploadingImage(false);
            }
            const payload = {
                ...formData,
                image: imageUrl
            };
            const response = await fetch("/api/coupons", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || "Unable to create coupon.");
            router.push("/dashboard/coupons");
            router.refresh();
        } catch (submitError) {
            setError(submitError.message);
            setLoading(false);
            setUploadingImage(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto max-w-4xl",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-6 flex items-center justify-between gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-2xl font-bold text-gray-800",
                            children: "Add Coupon"
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                            lineNumber: 103,
                            columnNumber: 71
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/dashboard/coupons",
                            className: "rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50",
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                            lineNumber: 103,
                            columnNumber: 135
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                    lineNumber: 103,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    className: "space-y-6 rounded-xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8",
                    children: [
                        error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-700",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                            lineNumber: 105,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-6 md:grid-cols-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "storeId",
                                            className: "mb-1 block text-sm font-medium text-gray-700",
                                            children: "Store *"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 106,
                                            columnNumber: 59
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            id: "storeId",
                                            name: "storeId",
                                            required: true,
                                            value: formData.storeId,
                                            onChange: handleChange,
                                            className: "w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "",
                                                    children: "Select store"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                                    lineNumber: 106,
                                                    columnNumber: 336
                                                }, this),
                                                stores.map((store)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: store._id,
                                                        children: store.name
                                                    }, store._id, false, {
                                                        fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                                        lineNumber: 106,
                                                        columnNumber: 395
                                                    }, this))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 106,
                                            columnNumber: 156
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 106,
                                    columnNumber: 54
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "type",
                                            className: "mb-1 block text-sm font-medium text-gray-700",
                                            children: "Coupon Type *"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 106,
                                            columnNumber: 480
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            id: "type",
                                            name: "type",
                                            value: formData.type,
                                            onChange: handleChange,
                                            className: "w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "code",
                                                    children: "Code expose"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                                    lineNumber: 106,
                                                    columnNumber: 742
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "link",
                                                    children: "Embedded link"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                                    lineNumber: 106,
                                                    columnNumber: 783
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 106,
                                            columnNumber: 580
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 106,
                                    columnNumber: 475
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                            lineNumber: 106,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-6 md:grid-cols-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "title",
                                            className: "mb-1 block text-sm font-medium text-gray-700",
                                            children: "Title *"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 107,
                                            columnNumber: 59
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            id: "title",
                                            name: "title",
                                            required: true,
                                            value: formData.title,
                                            onChange: handleChange,
                                            className: "w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 107,
                                            columnNumber: 154
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 107,
                                    columnNumber: 54
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "discount",
                                            className: "mb-1 block text-sm font-medium text-gray-700",
                                            children: "Discount *"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 107,
                                            columnNumber: 331
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            id: "discount",
                                            name: "discount",
                                            required: true,
                                            value: formData.discount,
                                            onChange: handleChange,
                                            placeholder: "20% or 15€",
                                            className: "w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 107,
                                            columnNumber: 432
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 107,
                                    columnNumber: 326
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                            lineNumber: 107,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "description",
                                    className: "mb-1 block text-sm font-medium text-gray-700",
                                    children: "Description *"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 108,
                                    columnNumber: 16
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    id: "description",
                                    name: "description",
                                    required: true,
                                    rows: "4",
                                    value: formData.description,
                                    onChange: handleChange,
                                    className: "w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 108,
                                    columnNumber: 123
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                            lineNumber: 108,
                            columnNumber: 11
                        }, this),
                        formData.type === "code" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "code",
                                    className: "mb-1 block text-sm font-medium text-gray-700",
                                    children: "Coupon Code *"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 109,
                                    columnNumber: 44
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    id: "code",
                                    name: "code",
                                    required: true,
                                    value: formData.code,
                                    onChange: handleChange,
                                    className: "w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 109,
                                    columnNumber: 144
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                            lineNumber: 109,
                            columnNumber: 39
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "couponUrl",
                                    className: "mb-1 block text-sm font-medium text-gray-700",
                                    children: "Coupon URL *"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 109,
                                    columnNumber: 321
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    id: "couponUrl",
                                    name: "couponUrl",
                                    type: "url",
                                    required: true,
                                    value: formData.couponUrl,
                                    onChange: handleChange,
                                    className: "w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 109,
                                    columnNumber: 425
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                            lineNumber: 109,
                            columnNumber: 316
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "border-t border-gray-100 pt-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "homepageSection",
                                    className: "mb-1 block text-sm font-medium text-gray-700",
                                    children: "Homepage Section"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 110,
                                    columnNumber: 58
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    id: "homepageSection",
                                    name: "homepageSection",
                                    value: formData.homepageSection,
                                    onChange: handleChange,
                                    className: "w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "featured",
                                            children: "Featured offers (white cards)"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 110,
                                            columnNumber: 367
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "secondary",
                                            children: "Secondary offers (image cards)"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 110,
                                            columnNumber: 430
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "new",
                                            children: "New codes"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 110,
                                            columnNumber: 495
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "expiring",
                                            children: "Expiring codes"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 110,
                                            columnNumber: 533
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 110,
                                    columnNumber: 172
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-1 text-xs text-gray-500",
                                    children: "Choose where this coupon appears on the homepage."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 110,
                                    columnNumber: 590
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                            lineNumber: 110,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "imageFile",
                                    className: "mb-1 block text-sm font-medium text-gray-700",
                                    children: "Coupon Image (Optional)"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 112,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "file",
                                    id: "imageFile",
                                    name: "imageFile",
                                    accept: "image/*",
                                    onChange: handleFileChange,
                                    className: "w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent-hover"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 113,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-1 text-xs text-gray-500",
                                    children: "Upload an image for this coupon (will be stored in Cloudinary)."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 114,
                                    columnNumber: 13
                                }, this),
                                imagePreview && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm text-gray-600 mb-2",
                                            children: "Image Preview:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 116,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative w-32 h-32 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: imagePreview,
                                                alt: "Preview",
                                                className: "max-h-full max-w-full object-contain p-2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                                lineNumber: 118,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 117,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 115,
                                    columnNumber: 30
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                            lineNumber: 111,
                            columnNumber: 11
                        }, this),
                        (formData.homepageSection === "new" || formData.homepageSection === "expiring") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-6 md:grid-cols-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "labelTop",
                                            className: "mb-1 block text-sm font-medium text-gray-700",
                                            children: "List label"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 122,
                                            columnNumber: 143
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            id: "labelTop",
                                            name: "labelTop",
                                            value: formData.labelTop,
                                            onChange: handleChange,
                                            placeholder: "CODICE or SPEDIZIONE",
                                            className: "w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 122,
                                            columnNumber: 244
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 122,
                                    columnNumber: 138
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "labelBottom",
                                            className: "mb-1 block text-sm font-medium text-gray-700",
                                            children: "Secondary label"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 122,
                                            columnNumber: 456
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            id: "labelBottom",
                                            name: "labelBottom",
                                            value: formData.labelBottom,
                                            onChange: handleChange,
                                            className: "w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 122,
                                            columnNumber: 565
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 122,
                                    columnNumber: 451
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                            lineNumber: 122,
                            columnNumber: 95
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-6 md:grid-cols-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "startsAt",
                                            className: "mb-1 block text-sm font-medium text-gray-700",
                                            children: "Start Date"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 123,
                                            columnNumber: 59
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            id: "startsAt",
                                            name: "startsAt",
                                            type: "date",
                                            value: formData.startsAt,
                                            onChange: handleChange,
                                            className: "w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 123,
                                            columnNumber: 160
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 123,
                                    columnNumber: 54
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "expiresAt",
                                            className: "mb-1 block text-sm font-medium text-gray-700",
                                            children: "Expiry Date"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 123,
                                            columnNumber: 349
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            id: "expiresAt",
                                            name: "expiresAt",
                                            type: "date",
                                            value: formData.expiresAt,
                                            onChange: handleChange,
                                            className: "w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 123,
                                            columnNumber: 452
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 123,
                                    columnNumber: 344
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                            lineNumber: 123,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "flex items-center gap-2 text-sm text-gray-700",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            name: "isActive",
                                            checked: formData.isActive,
                                            onChange: handleChange,
                                            className: "h-4 w-4 accent-accent"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 124,
                                            columnNumber: 104
                                        }, this),
                                        "Active"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 124,
                                    columnNumber: 39
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "flex items-center gap-2 text-sm text-gray-700",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            name: "isFeatured",
                                            checked: formData.isFeatured,
                                            onChange: handleChange,
                                            className: "h-4 w-4 accent-accent"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                            lineNumber: 124,
                                            columnNumber: 310
                                        }, this),
                                        "Featured"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                    lineNumber: 124,
                                    columnNumber: 245
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                            lineNumber: 124,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end border-t border-gray-100 pt-6",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                disabled: loading || stores.length === 0,
                                className: "rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50",
                                children: loading ? uploadingImage ? "Uploading Image..." : "Saving..." : "Create Coupon"
                            }, void 0, false, {
                                fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                                lineNumber: 125,
                                columnNumber: 75
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                            lineNumber: 125,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
                    lineNumber: 104,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
            lineNumber: 102,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/admin/coupons/CouponForm.jsx",
        lineNumber: 101,
        columnNumber: 10
    }, this);
}
_s(CouponForm, "a7LGSrHTwEea0MCfWyak/eh1Fcg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = CouponForm;
var _c;
__turbopack_context__.k.register(_c, "CouponForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_admin_coupons_CouponForm_jsx_0721tva._.js.map