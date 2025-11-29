import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "../components/ui/card.tsx";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "../components/ui/table.tsx";
import {
    ArrowLeft,
    ArrowRight,
    BarChart3,
    TrendingUp,
    Calendar,
    X,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import fakeApi from "../data/fakeData";

const ITEMS_PER_PAGE = 5;

const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export default function RecapitulatifPage() {
    const navigate = useNavigate();
    const [monthlyGroups, setMonthlyGroups] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedMonths, setExpandedMonths] = useState({});
    const [finishedProducts, setFinishedProducts] = useState([]);
    const [totalPrime, setTotalPrime] = useState(0);
    const [allProducts, setAllProducts] = useState([]);

    const totalProducts = finishedProducts.length;
    const [pieces, setPieces] = useState([]);

    useEffect(() => {
        const fetchPieces = async () => {
            try {
                const data = await fakeApi.pieces.getAll();
                setPieces(data);
            } catch (err) {
                console.error("Failed to fetch pieces", err);
            }
        };

        fetchPieces();
    }, []);

    useEffect(() => {
        const fetchReceptions = async () => {
            try {
                const data = await fakeApi.receptions.getAll();

                const filtered = data.filter(rec => rec.etat === "finit" || rec.isReturned);

                setFinishedProducts(filtered);

                const groups = {};

                filtered.forEach((rec) => {
                    const date = new Date(rec.date);
                    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

                    const type = rec.isReturned ? "retourné" : rec.etat;

                    const product = {
                        id: rec._id,
                        reference: rec.receptionNumber || "-",
                        dateRecu: date.toLocaleDateString("fr-FR"),
                        originalData: rec,
                        type
                    };

                    if (!groups[monthYear]) {
                        groups[monthYear] = {
                            products: [],
                            finitCount: 0,
                            retourneCount: 0
                        };
                    }

                    groups[monthYear].products.push(product);
                    if (type === "finit") groups[monthYear].finitCount++;
                    if (type === "retourné") groups[monthYear].retourneCount++;
                });

                const sortedGroups = Object.entries(groups)
                    .map(([monthYear, groupData]) => {
                        const [year, month] = monthYear.split("-");

                        const sortedProducts = groupData.products.sort((a, b) => {
                            if (a.type === "finit" && b.type === "retourné") return -1;
                            if (a.type === "retourné" && b.type === "finit") return 1;
                            return 0;
                        });

                        const prime = groupData.finitCount * 1.5 - groupData.retourneCount * 5;

                        return {
                            month: monthNames[Number(month) - 1],
                            year,
                            products: sortedProducts,
                            count: sortedProducts.length,
                            finitCount: groupData.finitCount,
                            retourneCount: groupData.retourneCount,
                            prime,
                            currentPage: 0
                        };
                    })
                    .sort((a, b) => {
                        const dateA = new Date(Number(a.year), monthNames.indexOf(a.month));
                        const dateB = new Date(Number(b.year), monthNames.indexOf(b.month));
                        return dateB.getTime() - dateA.getTime();
                    });

                const total = sortedGroups.reduce((sum, group) => sum + group.prime, 0);

                setMonthlyGroups(sortedGroups);
                setTotalPrime(total);

                const initialExpanded = {};
                sortedGroups.forEach(group => {
                    initialExpanded[`${group.month}-${group.year}`] = true;
                });
                setExpandedMonths(initialExpanded);
            } catch (error) {
                console.error("Erreur lors du chargement :", error);
            }
        };

        fetchReceptions();
    }, []);

    const currentMonth = monthlyGroups.find((group) => {
        const currentDate = new Date();
        return (
            group.month === monthNames[currentDate.getMonth()] &&
            group.year === currentDate.getFullYear().toString()
        );
    });

    const toggleMonthExpansion = (monthYear) => {
        setExpandedMonths(prev => ({
            ...prev,
            [monthYear]: !prev[monthYear]
        }));
    };

    const changePage = (monthYear, direction) => {
        setMonthlyGroups(prevGroups => {
            return prevGroups.map(group => {
                const key = `${group.month}-${group.year}`;
                if (key === monthYear) {
                    const totalPages = Math.ceil(group.products.length / ITEMS_PER_PAGE);
                    let newPage = group.currentPage;

                    if (direction === 'prev' && group.currentPage > 0) {
                        newPage = group.currentPage - 1;
                    } else if (direction === 'next' && group.currentPage < totalPages - 1) {
                        newPage = group.currentPage + 1;
                    }

                    return { ...group, currentPage: newPage };
                }
                return group;
            });
        });
    };

    const openModal = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedProduct(null);
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="mb-6 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center">
                            <div className="bg-purple-100 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4">
                                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Récapitulatif des Produits</h1>
                                <p className="text-sm sm:text-base text-gray-600 mt-1">Analyse mensuelle des états et calcul des primes</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">Total Général</CardTitle>
                                <div className="bg-blue-100 p-1 sm:p-2 rounded-full">
                                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalProducts}</div>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">Produits finis au total</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">Ce Mois</CardTitle>
                                <div className="bg-green-100 p-1 sm:p-2 rounded-full">
                                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{currentMonth?.count || 0}</div>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                    {monthNames[new Date().getMonth()]} {new Date().getFullYear()}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium text-gray-500">Prime Totale</CardTitle>
                                <div className="bg-purple-100 p-1 sm:p-2 rounded-full">
                                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalPrime.toFixed(2)} DT</div>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">Cumul des primes mensuelles</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Product Tables by Month */}
                <div className="space-y-4">
                    {monthlyGroups.map((group) => {
                        const monthYearKey = `${group.month}-${group.year}`;
                        const isExpanded = expandedMonths[monthYearKey];
                        const totalPages = Math.ceil(group.products.length / ITEMS_PER_PAGE);
                        const hasPagination = totalPages > 1;

                        return (
                            <Card key={monthYearKey} className="border-0 shadow-sm overflow-hidden transition-all duration-200">
                                <button
                                    onClick={() => toggleMonthExpansion(monthYearKey)}
                                    className="w-full hover:bg-gray-50 transition-colors"
                                >
                                    <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between p-4">
                                        <div className="flex items-center mb-2 sm:mb-0">
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                                {group.month} {group.year}
                                            </h3>
                                            <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                                {group.count} produit{group.count > 1 ? "s" : ""}
                                            </span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="mr-2 sm:mr-4 text-xs sm:text-sm text-gray-600">
                                                Prime: <span className="font-semibold text-blue-600">{group.prime.toFixed(2)} DT</span>
                                            </span>
                                            {isExpanded ? (
                                                <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                                            )}
                                        </div>
                                    </CardHeader>
                                </button>

                                {isExpanded && (
                                    <CardContent className="border-t p-0">
                                        <div className="overflow-x-auto">
                                            <Table className="min-w-full">
                                                <TableHeader className="bg-gray-50">
                                                    <TableRow>
                                                        <TableHead className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">Référence</TableHead>
                                                        <TableHead className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">Date Reçu</TableHead>
                                                        <TableHead className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm hidden sm:table-cell">Collection</TableHead>
                                                        <TableHead className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm hidden md:table-cell">Client</TableHead>
                                                        <TableHead className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">Type</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {group.products
                                                        .slice(group.currentPage * ITEMS_PER_PAGE, (group.currentPage + 1) * ITEMS_PER_PAGE)
                                                        .map((product) => (
                                                            <TableRow
                                                                key={product.id}
                                                                className={`hover:bg-gray-50 ${product.type === "retourné" ? "bg-red-50" : ""}`}
                                                            >
                                                                <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">
                                                                    <button
                                                                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                                                        onClick={() => openModal(product.originalData)}
                                                                    >
                                                                        {product.originalData.extra?.serialNumber
                                                                            ? typeof product.originalData.extra.serialNumber === "string"
                                                                                ? product.originalData.extra.serialNumber
                                                                                : product.originalData.extra.serialNumber.serialNumber
                                                                            : product.reference}
                                                                    </button>
                                                                </TableCell>

                                                                <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">{product.dateRecu}</TableCell>
                                                                <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm hidden sm:table-cell">
                                                                    {product.originalData?.etrier?.carModel || "-"}
                                                                </TableCell>
                                                                <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm hidden md:table-cell">
                                                                    {product.originalData?.client?.name || "-"}
                                                                </TableCell>
                                                                <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">
                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
                                    ${product.type === "finit" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                                        {product.type}
                                                                    </span>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Pagination Controls */}
                                        {hasPagination && (
                                            <div className="flex items-center justify-between px-4 py-3 border-t">
                                                <button
                                                    onClick={() => changePage(monthYearKey, 'prev')}
                                                    disabled={group.currentPage === 0}
                                                    className={`flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm 
                            ${group.currentPage === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                                >
                                                    <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                    Précédent
                                                </button>
                                                <span className="text-xs sm:text-sm text-gray-600">
                                                    Page {group.currentPage + 1} sur {totalPages}
                                                </span>
                                                <button
                                                    onClick={() => changePage(monthYearKey, 'next')}
                                                    disabled={group.currentPage === totalPages - 1}
                                                    className={`flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm 
                            ${group.currentPage === totalPages - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                                >
                                                    Suivant
                                                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                                                </button>
                                            </div>
                                        )}

                                        {/* Summary */}
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 py-3 border-t">
                                            <div className="flex space-x-2 sm:space-x-4 mb-2 sm:mb-0">
                                                <span className="inline-flex items-center text-xs sm:text-sm">
                                                    <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-100 mr-1"></span>
                                                    Finis: {group.finitCount}
                                                </span>
                                                <span className="inline-flex items-center text-xs sm:text-sm">
                                                    <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-100 mr-1"></span>
                                                    Retournés: {group.retourneCount}
                                                </span>
                                            </div>
                                            <p className="text-xs sm:text-sm font-medium text-gray-700">
                                                Prime: <span className="text-blue-600">{group.prime.toFixed(2)} DT</span>
                                            </p>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Product Details Modal */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md sm:max-w-lg md:max-w-2xl transform overflow-hidden rounded-2xl bg-white p-5 sm:p-6 text-left align-middle shadow-xl transition-all border border-gray-100">
                                    {/* Header */}
                                    <div className="flex justify-between items-center mb-4 pb-3 border-b">
                                        <Dialog.Title
                                            as="h3"
                                            className="text-lg sm:text-xl font-bold leading-6 text-gray-900"
                                        >
                                            Détails du Produit
                                        </Dialog.Title>
                                        <button
                                            onClick={closeModal}
                                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                            aria-label="Close modal"
                                        >
                                            <X className="w-5 h-5 text-gray-500" />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    {selectedProduct ? (
                                        <div className="space-y-5">
                                            {/* Grid Info */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Left */}
                                                <div className="space-y-3">
                                                    <div>
                                                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                                                            Référence
                                                        </h4>
                                                        <p className="text-gray-700 whitespace-pre-wrap">
                                                            {typeof selectedProduct.extra.serialNumber === "string"
                                                                ? selectedProduct.extra.serialNumber
                                                                : selectedProduct.extra.serialNumber?.serialNumber || ""}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                                                            Date
                                                        </h4>
                                                        <p className="mt-1 text-sm text-gray-700">
                                                            {new Date(selectedProduct.date).toLocaleDateString("fr-FR")}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                                                            État
                                                        </h4>
                                                        <p className="mt-1 text-sm">
                                                            <span
                                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize
                          ${selectedProduct.etat === "finit"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : "bg-red-100 text-red-800"
                                                                    }`}
                                                            >
                                                                {selectedProduct.etat}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Right */}
                                                <div className="space-y-3">
                                                    <div>
                                                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                                                            Position
                                                        </h4>
                                                        <p className="mt-1 text-sm text-gray-700">
                                                            {selectedProduct.position || "-"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                                                            Nom du Client
                                                        </h4>
                                                        <p className="mt-1 text-sm text-gray-700">
                                                            {selectedProduct.client?.name || "-"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                                                            Modèle de Voiture
                                                        </h4>
                                                        <p className="mt-1 text-sm text-gray-700">
                                                            {selectedProduct.etrier?.carModel || "-"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Observation */}
                                            <div>
                                                <h4 className="text-xs sm:text-sm font-medium text-gray-500">
                                                    Observation
                                                </h4>
                                                <p className="mt-1 text-sm bg-gray-50 text-gray-700 p-3 rounded-lg">
                                                    {selectedProduct.observation || "Aucune observation"}
                                                </p>
                                            </div>

                                            {/* Extras Section */}
                                            {selectedProduct.extra && (
                                                <div className="border-t pt-4 mt-6">
                                                    <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-3">
                                                        Informations supplémentaires
                                                    </h4>

                                                    {/* Pieces Used */}
                                                    {selectedProduct.extra.pieceCounters && pieces?.length ? (
                                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                                            {Object.entries(selectedProduct.extra.pieceCounters).map(
                                                                ([pieceId, count]) => {
                                                                    const piece = pieces.find((p) => p._id === pieceId);
                                                                    return (
                                                                        <div
                                                                            key={pieceId}
                                                                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                                                                            title={`${piece?.designation || "Inconnu"} - ${piece?.referenceArticle || "Réf inconnue"}`}
                                                                        >
                                                                            <span className="text-gray-800 font-semibold">
                                                                                {piece?.referenceArticle || "Réf. Inconnue"}
                                                                            </span>
                                                                            <span className="text-gray-700 truncate max-w-xs">
                                                                                {piece?.designation || "Désignation inconnue"}
                                                                            </span>
                                                                            <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
                                                                                {count} pièce{count > 1 ? "s" : ""}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-gray-500 text-sm italic">Aucune pièce utilisée.</p>
                                                    )}

                                                    {/* Other extra fields (exclude pieceCounters) */}

                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex justify-center py-6 sm:py-10">
                                            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-blue-500" />
                                        </div>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

        </div>
    );
}