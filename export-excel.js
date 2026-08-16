/* =========================================================
   NAMMUDE — EXPORT REPORTS TO EXCEL
   Supabase → Excel (.xlsx)
========================================================= */

const SUPABASE_URL = "https://ukbdqrvmdrlqqfqbnkle.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_Pc7qVHy1ojZFq795l2PmSg_6fm7M6Hf";

const REPORTS_TABLE = "reports";


/* =========================================================
   SUPABASE CLIENT
========================================================= */

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


/* =========================================================
   EXPORT FUNCTION
========================================================= */

async function exportReportsToExcel() {

    const button = document.getElementById("exportExcelBtn");

    try {

        /* ---------------------------------------------
           Check required libraries
        --------------------------------------------- */

        if (!window.supabase) {
            throw new Error("Supabase library is not loaded.");
        }

        if (!window.XLSX) {
            throw new Error("Excel library is not loaded.");
        }

        if (!button) {
            throw new Error(
                'Button with ID "exportExcelBtn" was not found.'
            );
        }


        /* ---------------------------------------------
           Disable button while exporting
        --------------------------------------------- */

        button.disabled = true;
        button.textContent = "Preparing Excel...";


        /* ---------------------------------------------
           Fetch reports from Supabase
        --------------------------------------------- */

        const { data, error } = await supabaseClient
            .from(REPORTS_TABLE)
            .select("*")
            .order("created_at", {
                ascending: false
            });


        /* ---------------------------------------------
           Handle Supabase error
        --------------------------------------------- */

        if (error) {
            console.error(
                "Supabase export error:",
                error
            );

            throw new Error(
                error.message || "Could not fetch reports."
            );
        }


        /* ---------------------------------------------
           Check whether reports exist
        --------------------------------------------- */

        if (!data || data.length === 0) {

            alert("No reports found.");

            return;
        }


        /* ---------------------------------------------
           Convert Supabase data → Excel worksheet
        --------------------------------------------- */

        const worksheet =
            XLSX.utils.json_to_sheet(data);


        /* ---------------------------------------------
           Create workbook
        --------------------------------------------- */

        const workbook =
            XLSX.utils.book_new();


        /* ---------------------------------------------
           Add worksheet
        --------------------------------------------- */

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Reports"
        );


        /* ---------------------------------------------
           Auto-size columns
        --------------------------------------------- */

        const columnWidths = [];

        data.forEach(row => {

            Object.keys(row).forEach((key, index) => {

                const value =
                    row[key] === null ||
                    row[key] === undefined
                        ? ""
                        : String(row[key]);

                const headerLength =
                    String(key).length;

                const valueLength =
                    value.length;

                const currentWidth =
                    columnWidths[index] || 10;

                columnWidths[index] =
                    Math.min(
                        Math.max(
                            currentWidth,
                            headerLength + 2,
                            valueLength + 2
                        ),
                        50
                    );

            });

        });

        worksheet["!cols"] =
            columnWidths.map(width => ({
                wch: width
            }));


        /* ---------------------------------------------
           Generate Excel file
        --------------------------------------------- */

        XLSX.writeFile(
            workbook,
            "Nammude_Reports.xlsx"
        );


        /* ---------------------------------------------
           Success message
        --------------------------------------------- */

        alert(
            `${data.length} report(s) exported successfully.`
        );

    } catch (error) {

        console.error(
            "Excel export failed:",
            error
        );

        alert(
            "Export failed.\n\n" +
            (error.message ||
                "Please check your Supabase connection.")
        );

    } finally {

        /* ---------------------------------------------
           Restore button
        --------------------------------------------- */

        if (button) {

            button.disabled = false;

            button.textContent =
                "📊 Export to Excel";
        }

    }
}


/* =========================================================
   CONNECT BUTTON
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const button =
            document.getElementById(
                "exportExcelBtn"
            );

        if (!button) {

            console.warn(
                'Nammude: "exportExcelBtn" not found.'
            );

            return;
        }


        button.addEventListener(
            "click",
            exportReportsToExcel
        );

    }
);
