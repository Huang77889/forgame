
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  fetch: withSupabase(
    { auth: "publishable" },
    async (req, ctx) => {
      // 只允許 POST
      if (req.method !== "POST") {
        return Response.json(
          { success: false, message: "不支援的請求方式" },
          { status: 405 }
        );
      }

      try {
        const form = await req.formData();

        const schoolId = String(form.get("school_id") ?? "").trim();
        const studentNumber = String(
          form.get("student_number") ?? ""
        ).trim();
        const studentName = String(
          form.get("student_name") ?? ""
        ).trim();
        const weekNumber = Number(form.get("week_number"));
        const file = form.get("file");

        // 基本資料檢查
        if (
          !schoolId ||
          !studentNumber ||
          !studentName ||
          !Number.isInteger(weekNumber) ||
          weekNumber < 1 ||
          weekNumber > 99 ||
          !(file instanceof File)
        ) {
          return Response.json(
            { success: false, message: "請確認填寫資料及上傳檔案" },
            { status: 400 }
          );
        }

        // 檔案大小限制：50 MB
        if (file.size === 0 || file.size > 50 * 1024 * 1024) {
          return Response.json(
            { success: false, message: "檔案不可為空，且不得超過 50 MB" },
            { status: 400 }
          );
        }

        // 確認學校存在且啟用
        const { data: school, error: schoolError } =
          await ctx.supabaseAdmin
            .from("schools")
            .select("school_id")
            .eq("school_id", schoolId)
            .eq("is_active", true)
            .maybeSingle();

        if (schoolError || !school) {
          console.error("學校查詢失敗：", {
            schoolId,
            error: schoolError,
            result: school
          });

          return Response.json(
            { success: false, message: "學校資料不正確" },
            { status: 403 }
          );
        }

        // 比對學校、學號、姓名是否完全符合名單
        const { data: student, error: studentError } =
          await ctx.supabaseAdmin
            .from("students")
            .select("school_id")
            .eq("school_id", schoolId)
            .eq("student_number", studentNumber)
            .eq("student_name", studentName)
            .maybeSingle();

        if (studentError || !student) {
          return Response.json(
            {
              success: false,
              message: "查無符合的學生資料，請確認學校、姓名及學號"
            },
            { status: 403 }
          );
        }

        // 建立固定檔案路徑，同一學生同一週重新上傳會覆蓋
        const safeSchoolId = encodeURIComponent(schoolId);
        const safeStudentNumber = encodeURIComponent(studentNumber);

        const filePath =
          `${safeSchoolId}/${safeStudentNumber}/week${weekNumber}/submission`;

        // 上傳檔案
        const { error: uploadError } =
          await ctx.supabaseAdmin.storage
            .from("assignment-files")
            .upload(filePath, file, {
              upsert: true,
              contentType: file.type || "application/octet-stream"
            });

        if (uploadError) {
          console.error("檔案上傳失敗：", uploadError);

          return Response.json(
            { success: false, message: "檔案上傳失敗，請稍後再試" },
            { status: 500 }
          );
        }

        // 新增或更新作業紀錄
        const { error: recordError } =
          await ctx.supabaseAdmin
            .from("student_submissions")
            .upsert(
              {
                user_id: null,
                school_id: schoolId,
                student_name: studentName,
                student_number: studentNumber,
                week_number: weekNumber,
                file_name: file.name,
                file_path: filePath,
                submitted_at: new Date().toISOString()
              },
              {
                onConflict: "school_id,student_number,week_number"
              }
            );

        if (recordError) {
          console.error("作業紀錄寫入失敗：", recordError);

          return Response.json(
            { success: false, message: "作業紀錄儲存失敗" },
            { status: 500 }
          );
        }

        return Response.json({
          success: true,
          message: "作業上傳成功！"
        });

      } catch (error) {
        console.error("伺服器錯誤：", error);

        return Response.json(
          { success: false, message: "系統發生錯誤，請稍後再試" },
          { status: 500 }
        );
      }
    }
  )
};
